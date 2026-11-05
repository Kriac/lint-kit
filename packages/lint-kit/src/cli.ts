#!/usr/bin/env node
import { cac } from "cac";
import { init } from "./cli/init.ts";
import { check } from "./cli/check.ts";
import { output } from "./cli/output.ts";
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
  .option("--eslint", "检查 ESLint")
  .option("--stylelint", "检查 Stylelint")
  .option("--commitlint <file>", "校验指定文件中的提交信息")
  .action(check);

try {
  cli.parse(undefined, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  output.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
