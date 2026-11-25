import type { CheckOptions, Linter } from "./check-utils.ts";
import { resolveCwd } from "./utils/cwd.ts";
import { measureTask, output } from "./utils/output.ts";
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
  const cwd = await resolveCwd(options.cwd);

  const linters = selectLinters(options);
  const fix = options.fix === true;
  const parallel = !fix && linters.length > 1;

  async function checkLinter(linter: Linter) {
    const configPath = await findConfigPath(linter, cwd);
    const args = await buildLinterArgs(linter, configPath, files, cwd, options);
    if (!args) {
      return 0;
    }

    const lintName = linterNames[linter];
    if (parallel) {
      return runLinter(linter, args, cwd, fix, () => {
        output.info(`${lintName} 检查结果`);
      });
    }

    output.info(`正在执行 ${lintName}...`);
    return runLinter(linter, args, cwd, fix);
  }

  const { result: exitCode, durationMs } = await measureTask(async () => {
    let exitCode = 0;

    if (parallel) {
      const results = await Promise.allSettled(linters.map(checkLinter));
      for (const result of results) {
        if (result.status === "rejected") {
          throw result.reason;
        }
        exitCode = Math.max(exitCode, result.value);
      }
      return exitCode;
    }

    for (const linter of linters) {
      exitCode = Math.max(exitCode, await checkLinter(linter));
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
