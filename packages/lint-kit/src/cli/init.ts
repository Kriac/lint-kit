import type { Linter } from "./check-utils.ts";
import type { VscodeLinter } from "./init-utils.ts";
import { isCancel, multiselect } from "@clack/prompts";
import { output } from "./utils/output.ts";
import { resolveCwd } from "./utils/cwd.ts";
import { writeLinterConfigs, writeVscodeConfig } from "./init-utils.ts";

/**
 * init 命令的项目目录选项。
 */
export interface InitOptions {
  cwd?: string;
}

const linterOptions: { label: string; value: Linter }[] = [
  { label: "Prettier", value: "prettier" },
  { label: "ESLint", value: "eslint" },
  { label: "Stylelint", value: "stylelint" },
  { label: "Commitlint", value: "commitlint" },
];
const vscodeOptions: { label: string; value: VscodeLinter }[] = [
  { label: "Prettier", value: "prettier" },
  { label: "ESLint", value: "eslint" },
  { label: "Stylelint", value: "stylelint" },
];

/**
 * 选择需要的 lint 工具并在项目目录中生成配置文件。
 */
export async function init(options: InitOptions = {}) {
  const cwd = await resolveCwd(options.cwd);

  const selected = await multiselect<Linter>({
    message: "请选择需要初始化的工具",
    options: linterOptions,
    initialValues: linterOptions.map((option) => {
      return option.value;
    }),
    required: false,
  });

  if (isCancel(selected)) {
    process.exitCode = 130;
    return;
  }

  const availableVscodeOptions = vscodeOptions.filter((option) => {
    return selected.length === 0 || selected.includes(option.value);
  });
  const vscodeSelected =
    availableVscodeOptions.length > 0
      ? await multiselect({
          message: "请选择需要集成的 VS Code 插件",
          options: availableVscodeOptions,
          initialValues: availableVscodeOptions.map((option) => {
            return option.value;
          }),
          required: false,
        })
      : [];
  if (isCancel(vscodeSelected)) {
    process.exitCode = 130;
    return;
  }

  if (selected.length === 0 && vscodeSelected.length === 0) {
    output.info("未选择任何工具，无需生成配置文件");
    return;
  }

  await writeLinterConfigs(cwd, selected);
  if (vscodeSelected.length > 0) {
    await writeVscodeConfig(cwd, vscodeSelected);
  }
}
