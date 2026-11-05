import type { CheckOptions, Linter } from "./check-utils.ts";
import { resolve } from "node:path";
import { stat } from "node:fs/promises";
import { measureTask, output } from "./output.ts";
import {
  buildLinterArgs,
  findConfigPath,
  runLinter,
  selectLinters,
} from "./check-utils.ts";

const linterNames: Record<Linter, string> = {
  eslint: "ESLint",
  prettier: "Prettier",
  stylelint: "Stylelint",
  commitlint: "Commitlint",
};

/**
 * 使用内置 lint 工具及目标项目的配置执行检查，并设置退出码。
 */
export async function check(files: string[] = [], options: CheckOptions = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  if (!(await stat(cwd)).isDirectory()) {
    throw new Error(`${cwd} 不是一个目录`);
  }

  const { result: exitCode, durationMs } = await measureTask(async () => {
    let exitCode = 0;

    for (const linter of selectLinters(options)) {
      const configPath = await findConfigPath(linter, cwd);
      const args = await buildLinterArgs(
        linter,
        configPath,
        files,
        cwd,
        options,
      );
      if (!args) {
        continue;
      }

      const lintName = linterNames[linter];
      output.info(`正在执行 ${lintName}...`);
      exitCode = Math.max(exitCode, await runLinter(linter, args, cwd));
    }

    return exitCode;
  });

  const duration = output.duration(durationMs, exitCode === 0);
  const message = `检查完成，总共耗时 ${duration}`;
  if (exitCode === 0) {
    output.success(message);
  } else {
    output.error(message);
  }

  process.exitCode = exitCode;
}
