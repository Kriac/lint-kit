import type { Linter } from "./check-utils.ts";
import { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { assign, parse, stringify, tokenize } from "comment-json";
import { output } from "./output.ts";

type JsonObject = Record<string, unknown>;

/**
 * 支持 VS Code 插件集成的 lint 工具。
 */
export type VscodeLinter = "eslint" | "stylelint";

const configContents: Record<Linter, string> = {
  eslint: `import config from "@kriac/lint-kit/eslint";

export default config();
`,
  stylelint: `export default {
  extends: ["@kriac/lint-kit/stylelint"],
};
`,
  commitlint: `import config from "@kriac/lint-kit/commitlint";

export default config();
`,
};

/**
 * 为选中的工具生成配置文件，不覆盖已有文件。
 */
export async function writeLinterConfigs(cwd: string, selected: Linter[]) {
  for (const linter of selected) {
    const filename = `${linter}.config.mjs`;
    try {
      await writeFile(join(cwd, filename), configContents[linter], {
        encoding: "utf8",
        flag: "wx",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ) {
        output.success(`已配置 ${filename}`);
        continue;
      }
      throw error;
    }
    output.success(`已生成 ${filename}`);
  }
}

function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateKeys(contents: string, path: string) {
  const tokens = tokenize(contents).filter((token) => {
    return token.type !== "LineComment" && token.type !== "BlockComment";
  });
  const objectKeys: (Set<string> | undefined)[] = [];
  for (const [index, token] of tokens.entries()) {
    if (token.value === "{") {
      objectKeys.push(new Set());
    } else if (token.value === "[") {
      objectKeys.push(undefined);
    } else if (token.value === "}" || token.value === "]") {
      objectKeys.pop();
    } else if (token.type === "String" && tokens[index + 1]?.value === ":") {
      const key: string = JSON.parse(token.value);
      if (key === "__proto__") {
        throw new Error(`${path} 包含无法安全处理的 __proto__ 属性`);
      }
      const keys = objectKeys.at(-1);
      if (keys?.has(key)) {
        throw new Error(`${path} 包含重复属性 ${key}`);
      }
      keys?.add(key);
    }
  }
}

async function readJsonObject(path: string): Promise<JsonObject> {
  let contents: string;
  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }

  let value: unknown;
  try {
    value = parse(contents);
  } catch (error) {
    throw new Error(`无法解析 ${path}`, { cause: error });
  }
  validateKeys(contents, path);
  if (!isObject(value)) {
    throw new Error(`${path} 的内容必须是 JSON 对象`);
  }
  return value;
}

function sortObject(value: JsonObject): JsonObject {
  // 先保留对象级注释，再按顺序复制属性及其注释。
  const sorted: JsonObject = Object.create(null);
  assign(sorted, value);
  for (const key of Object.keys(sorted)) {
    delete sorted[key];
  }
  return assign(sorted, value, Object.keys(value).sort());
}

function recommendExtension(recommendations: string[], extension: string) {
  const exists = recommendations.some((value) => {
    return value.toLowerCase() === extension;
  });
  if (!exists) {
    recommendations.push(extension);
  }
}

/**
 * 合并并排序 VS Code 设置与插件推荐，保留已有配置和注释。
 */
export async function writeVscodeConfig(cwd: string, selected: VscodeLinter[]) {
  const directory = join(cwd, ".vscode");
  const settingsPath = join(directory, "settings.json");
  const extensionsPath = join(directory, "extensions.json");
  const [settings, extensions] = await Promise.all([
    readJsonObject(settingsPath),
    readJsonObject(extensionsPath),
  ]);

  const existingActions = settings["editor.codeActionsOnSave"];
  if (existingActions !== undefined && !isObject(existingActions)) {
    throw new Error(`${settingsPath} 中 editor.codeActionsOnSave 必须是对象`);
  }
  const actions = existingActions ?? {};

  const existingRecommendations = extensions.recommendations;
  if (
    existingRecommendations !== undefined &&
    (!Array.isArray(existingRecommendations) ||
      !existingRecommendations.every((value) => {
        return typeof value === "string";
      }))
  ) {
    throw new Error(`${extensionsPath} 中 recommendations 必须是字符串数组`);
  }
  const recommendations: string[] = existingRecommendations ?? [];

  if (selected.includes("eslint")) {
    settings["eslint.nodePath"] = "node_modules/@kriac/lint-kit";
    actions["source.fixAll.eslint"] = "explicit";
    recommendExtension(recommendations, "dbaeumer.vscode-eslint");
  }
  if (selected.includes("stylelint")) {
    settings["css.validate"] = false;
    settings["stylelint.stylelintPath"] =
      "node_modules/@kriac/lint-kit/node_modules/stylelint";
    settings["stylelint.validate"] = ["html", "css", "vue", "scss"];
    settings["stylelint.ignorePath"] = "${workspaceFolder}/.stylelintignore";
    actions["source.fixAll.stylelint"] = "explicit";
    recommendExtension(recommendations, "stylelint.vscode-stylelint");
  }

  settings["editor.codeActionsOnSave"] = sortObject(actions);
  extensions.recommendations = recommendations.sort();

  const settingsContents = `${stringify(sortObject(settings), null, 2)}\n`;
  const extensionsContents = `${stringify(sortObject(extensions), null, 2)}\n`;
  await mkdir(directory, { recursive: true });
  await writeFile(settingsPath, settingsContents, "utf8");
  output.success(`已更新 ${join(".vscode", "settings.json")}`);
  await writeFile(extensionsPath, extensionsContents, "utf8");
  output.success(`已更新 ${join(".vscode", "extensions.json")}`);
}
