import type { Linter } from "./config.ts";
import { resolve } from "node:path";
import { stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { findConfigPath, resolveBinaryPath } from "./config.ts";
import { buildEslintArgs, eslintConfigSearchPlaces } from "./linters/eslint.ts";
import {
  buildStylelintArgs,
  stylelintConfigSearchPlaces,
} from "./linters/stylelint.ts";
import {
  buildCommitlintArgs,
  commitlintConfigSearchPlaces,
} from "./linters/commitlint.ts";

/**
 * check 命令的工具选择、文件检查和提交信息文件选项。
 */
export interface CheckOptions {
  commitlint?: string;
  cwd?: string;
  eslint?: boolean;
  fix?: boolean;
  stylelint?: boolean;
}

const defaultLinters = ["eslint", "stylelint"] as const;
const configSearchPlaces: Record<Linter, string[]> = {
  eslint: eslintConfigSearchPlaces,
  stylelint: stylelintConfigSearchPlaces,
  commitlint: commitlintConfigSearchPlaces,
};

function selectLinters(options: CheckOptions): Linter[] {
  const hasExplicitSelection =
    options.commitlint !== undefined ||
    defaultLinters.some((linter) => {
      return options[linter] === true;
    });
  const selected: Linter[] = defaultLinters.filter((linter) => {
    if (hasExplicitSelection) {
      return options[linter] === true;
    }
    return options[linter] !== false;
  });
  if (options.commitlint !== undefined) {
    selected.push("commitlint");
  }
  return selected;
}

async function buildLinterArgs(
  linter: Linter,
  configPath: string,
  files: string[],
  cwd: string,
  options: CheckOptions,
): Promise<string[] | undefined> {
  switch (linter) {
    case "eslint":
      return buildEslintArgs(configPath, files, options.fix === true);
    case "stylelint":
      return buildStylelintArgs(configPath, files, cwd, options.fix === true);
    case "commitlint":
      return buildCommitlintArgs(configPath, cwd, options.commitlint);
  }
}

async function runLinter(
  linter: Linter,
  args: string[],
  cwd: string,
): Promise<number> {
  const binaryPath = await resolveBinaryPath(linter);
  return new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [binaryPath, ...args], {
      cwd,
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.once("error", reject);
    child.once("close", (code) => {
      resolveExit(code ?? 1);
    });
  });
}

/**
 * 使用内置 lint 工具及目标项目的配置，返回检查进程的退出码。
 */
export async function check(files: string[] = [], options: CheckOptions = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  if (!(await stat(cwd)).isDirectory()) {
    throw new Error(`项目目录不是文件夹：${cwd}`);
  }

  let exitCode = 0;

  for (const linter of selectLinters(options)) {
    const configPath = await findConfigPath(
      linter,
      cwd,
      configSearchPlaces[linter],
    );
    if (!configPath) {
      continue;
    }
    const args = await buildLinterArgs(linter, configPath, files, cwd, options);
    if (!args) {
      continue;
    }

    console.log(`[lint-kit] 正在检查 ${linter}`);
    exitCode = Math.max(exitCode, await runLinter(linter, args, cwd));
  }

  process.exitCode = exitCode;
}
