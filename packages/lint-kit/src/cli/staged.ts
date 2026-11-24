import { resolve } from "node:path";
import { resolveCwd } from "./utils/cwd.ts";
import { findConfigFile } from "./utils/config.ts";
import {
  lintStagedConfigSearchPlaces,
  lintStagedDefaultPattern,
} from "./linters/lint-staged.ts";
import lintStaged from "lint-staged";

/**
 * staged 命令的项目目录和配置文件选项。
 */
export interface StagedOptions {
  config?: string;
  cwd?: string;
}

/**
 * 执行 lint-staged 检查和修复暂存区文件。
 */
export async function staged(
  options: StagedOptions = {},
  cliPath = process.argv[1],
) {
  const cwd = await resolveCwd(options.cwd);

  const configPath = options.config
    ? resolve(cwd, options.config)
    : await findConfigFile("lint-staged", cwd, lintStagedConfigSearchPlaces);
  // 使用当前安装的 CLI 和 Node，避免依赖调用方的 PATH。
  const command = `"${process.execPath.replaceAll("\\", "/")}" "${cliPath.replaceAll("\\", "/")}" check --fix`;
  const success = await lintStaged({
    cwd,
    ...(configPath
      ? { configPath }
      : { config: { [lintStagedDefaultPattern]: command } }),
  });
  process.exitCode = success ? 0 : 1;
}
