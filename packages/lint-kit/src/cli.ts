#!/usr/bin/env node
import type { StagedOptions } from "./cli/staged.ts";
import { cac } from "cac";
import { init } from "./cli/init.ts";
import { check } from "./cli/check.ts";
import { staged } from "./cli/staged.ts";
import { output } from "./cli/utils/output.ts";
import packageJson from "../package.json" with { type: "json" };

const cli = cac("lint-kit");

cli.help().version(packageJson.version);

cli
  .command("init", "初始化项目配置文件")
  .option("--cwd <dir>", "指定项目目录")
  .action(init);

cli
  .command("check [...files]", "根据项目配置文件检查代码风格")
  .option("--cwd <dir>", "指定项目目录")
  .option("--fix", "自动修复问题")
  .option("--prettier", "检查 Prettier")
  .option("--eslint", "检查 ESLint")
  .option("--stylelint", "检查 Stylelint")
  .option("--commitlint <file>", "校验指定文件中的提交信息")
  .action(check);

cli
  .command("staged", "检查并修复 Git 暂存文件")
  .option("--cwd <dir>", "指定项目目录")
  .option("--config <file>", "指定 lint-staged 配置文件")
  .action((options: StagedOptions) => {
    return staged(options, import.meta.filename);
  });

try {
  cli.parse(undefined, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  output.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
