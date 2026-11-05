import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { parse } from "comment-json";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { output } from "../src/cli/output.ts";
import {
  writeLinterConfigs,
  writeVscodeConfig,
} from "../src/cli/init-utils.ts";

describe("init 辅助函数", () => {
  let cwd: string;
  let directory: string;

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "lint-kit-vscode-"));
    directory = join(cwd, ".vscode");
    vi.spyOn(output, "success").mockImplementation(() => {
      return undefined;
    });
    vi.spyOn(output, "info").mockImplementation(() => {
      return undefined;
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(cwd, { recursive: true, force: true });
  });

  it("生成 lint 配置时向上传递非文件已存在错误", async () => {
    await expect(
      writeLinterConfigs(join(cwd, "missing"), ["eslint"]),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(output.success).not.toHaveBeenCalled();
  });

  it("逐个输出生成与已存在的文件", async () => {
    await writeFile(join(cwd, "eslint.config.mjs"), "existing");

    await writeLinterConfigs(cwd, ["eslint", "stylelint"]);

    expect(await readFile(join(cwd, "eslint.config.mjs"), "utf8")).toBe(
      "existing",
    );
    expect(output.info).toHaveBeenCalledExactlyOnceWith(
      "已存在 eslint.config.mjs",
    );
    expect(output.success).toHaveBeenCalledExactlyOnceWith(
      "已生成 stylelint.config.mjs",
    );
  });

  it("为两个插件生成排序后的设置和推荐", async () => {
    await writeVscodeConfig(cwd, ["eslint", "stylelint"]);

    expect(output.success).toHaveBeenCalledTimes(2);
    expect(output.success).toHaveBeenNthCalledWith(
      1,
      `已更新 ${join(".vscode", "settings.json")}`,
    );
    expect(output.success).toHaveBeenNthCalledWith(
      2,
      `已更新 ${join(".vscode", "extensions.json")}`,
    );

    const settings = parse<Record<string, unknown>>(
      await readFile(join(directory, "settings.json"), "utf8"),
    );
    expect(settings).toEqual({
      "css.validate": false,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
        "source.fixAll.stylelint": "explicit",
      },
      "eslint.nodePath": "node_modules/@kriac/lint-kit",
      "stylelint.ignorePath": "${workspaceFolder}/.stylelintignore",
      "stylelint.stylelintPath":
        "node_modules/@kriac/lint-kit/node_modules/stylelint",
      "stylelint.validate": ["html", "css", "vue", "scss"],
    });
    expect(Object.keys(settings)).toEqual([
      "css.validate",
      "editor.codeActionsOnSave",
      "eslint.nodePath",
      "stylelint.ignorePath",
      "stylelint.stylelintPath",
      "stylelint.validate",
    ]);
    expect(
      parse(await readFile(join(directory, "extensions.json"), "utf8")),
    ).toEqual({
      recommendations: ["dbaeumer.vscode-eslint", "stylelint.vscode-stylelint"],
    });
  });

  it("合并已有 JSONC，覆盖对应值并保留其他配置和注释", async () => {
    await mkdir(directory);
    await writeFile(
      join(directory, "settings.json"),
      `// 文件头
{
  // 用户配置
  "z.setting": true,
  "eslint.nodePath": "old",
  "editor.codeActionsOnSave": {
    // 保留其他修复项
    "source.organizeImports": "explicit",
    "source.fixAll.eslint": "never",
  },
  "a.setting": 1,
}
// 文件尾
`,
    );
    await writeFile(
      join(directory, "extensions.json"),
      `{
  "unwantedRecommendations": ["unwanted.extension"],
  "recommendations": [
    // 用户的插件
    "user.extension",
    "dbaeumer.vscode-eslint",
  ],
}
`,
    );

    await writeVscodeConfig(cwd, ["eslint"]);
    const settingsText = await readFile(
      join(directory, "settings.json"),
      "utf8",
    );
    const extensionsText = await readFile(
      join(directory, "extensions.json"),
      "utf8",
    );
    const settings = parse<Record<string, unknown>>(settingsText);
    expect(settings).toEqual({
      "a.setting": 1,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
        "source.organizeImports": "explicit",
      },
      "eslint.nodePath": "node_modules/@kriac/lint-kit",
      "z.setting": true,
    });
    expect(Object.keys(settings)).toEqual([
      "a.setting",
      "editor.codeActionsOnSave",
      "eslint.nodePath",
      "z.setting",
    ]);
    expect(settingsText).toContain("// 文件头");
    expect(settingsText).toContain("// 文件尾");
    expect(settingsText).toContain("// 用户配置");
    expect(settingsText).toContain("// 保留其他修复项");
    expect(extensionsText).toContain("// 用户的插件");
    expect(parse(extensionsText)).toEqual({
      recommendations: ["dbaeumer.vscode-eslint", "user.extension"],
      unwantedRecommendations: ["unwanted.extension"],
    });

    await writeVscodeConfig(cwd, ["eslint"]);
    expect(await readFile(join(directory, "settings.json"), "utf8")).toBe(
      settingsText,
    );
    expect(await readFile(join(directory, "extensions.json"), "utf8")).toBe(
      extensionsText,
    );
  });

  it("JSONC 无效时报告错误且不覆盖已有文件", async () => {
    await mkdir(directory);
    const settingsPath = join(directory, "settings.json");
    const extensionsPath = join(directory, "extensions.json");
    await writeFile(settingsPath, '{ "user.setting": true }');
    await writeFile(extensionsPath, "{ invalid");

    await expect(writeVscodeConfig(cwd, ["eslint"])).rejects.toThrow(
      `无法解析 ${extensionsPath}`,
    );
    expect(await readFile(settingsPath, "utf8")).toBe(
      '{ "user.setting": true }',
    );
    expect(await readFile(extensionsPath, "utf8")).toBe("{ invalid");
  });

  it("已有插件推荐不是字符串数组时报告错误", async () => {
    await mkdir(directory);
    await writeFile(
      join(directory, "extensions.json"),
      '{ "recommendations": [42] }',
    );

    await expect(writeVscodeConfig(cwd, ["stylelint"])).rejects.toThrow(
      "recommendations 必须是字符串数组",
    );
  });

  it("不能安全保留特殊属性时不覆盖配置", async () => {
    await mkdir(directory);
    const settingsPath = join(directory, "settings.json");
    const contents =
      '{"nested":{"\\u005f_proto__" /* 注释 */ :{"value":true}}}';
    await writeFile(settingsPath, contents);

    await expect(writeVscodeConfig(cwd, ["eslint"])).rejects.toThrow(
      "无法安全处理的 __proto__ 属性",
    );
    expect(await readFile(settingsPath, "utf8")).toBe(contents);
  });

  it("存在重复属性时不覆盖配置", async () => {
    await mkdir(directory);
    const settingsPath = join(directory, "settings.json");
    const contents = '{"nested":{"key":1,"key":2}}';
    await writeFile(settingsPath, contents);

    await expect(writeVscodeConfig(cwd, ["eslint"])).rejects.toThrow(
      "包含重复属性 key",
    );
    expect(await readFile(settingsPath, "utf8")).toBe(contents);
  });
});
