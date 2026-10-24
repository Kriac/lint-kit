import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { cosmiconfig } from "cosmiconfig";

/**
 * check 命令支持的内置 lint 工具。
 */
export type Linter = "commitlint" | "eslint" | "stylelint";

const require = createRequire(import.meta.url);
const scriptExtensions = ["js", "mjs", "cjs", "ts", "mts", "cts"];

/**
 * 按指定优先级查找配置路径。
 */
export async function findConfigPath(
  linter: Linter,
  cwd: string,
  searchPlaces: string[],
): Promise<string | undefined> {
  const explorer = cosmiconfig(linter, {
    searchPlaces,
    searchStrategy: "global",
    // 配置仅在内置 CLI 中执行，避免发现阶段重复运行用户的 JS/TS 配置。
    loaders: {
      ...Object.fromEntries(
        scriptExtensions.map((extension) => {
          return [
            `.${extension}`,
            () => {
              return {};
            },
          ];
        }),
      ),
      ".json": (_filepath, content) => {
        return JSON.parse(content.replace(/^\uFEFF/, ""));
      },
    },
  });
  const config = await explorer.search(cwd);
  return config && !config.isEmpty ? config.filepath : undefined;
}

/**
 * 从 lint-kit 自身的依赖中定位工具的 CLI 入口。
 */
export async function resolveBinaryPath(linter: Linter): Promise<string> {
  const packageJsonPath = require.resolve(`${linter}/package.json`);
  const manifest = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    bin: Record<string, string> | string;
  };
  const binaryPath =
    typeof manifest.bin === "string" ? manifest.bin : manifest.bin[linter];
  return resolve(dirname(packageJsonPath), binaryPath);
}
