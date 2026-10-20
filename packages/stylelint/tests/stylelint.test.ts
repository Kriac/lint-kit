import type { Config } from "stylelint";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import stylelint from "stylelint";
import config from "../src/index";

const cwd = fileURLToPath(new URL("..", import.meta.url));

interface LintOptions {
  filePath?: string;
  fix?: boolean;
  rules?: Config["rules"];
}

async function lintCode(
  code: string,
  { filePath = "example.css", fix = false, rules = {} }: LintOptions = {},
) {
  const result = await stylelint.lint({
    code,
    codeFilename: resolve(cwd, filePath),
    config: { ...config, rules: { ...config.rules, ...rules } },
    cwd,
    fix,
  });
  expect(result.results).toHaveLength(1);

  const [lintResult] = result.results;
  expect(lintResult.parseErrors).toEqual([]);
  expect(lintResult.invalidOptionWarnings).toEqual([]);
  return {
    ...lintResult,
    code: result.code,
  };
}

async function expectRuleFix(
  code: string,
  fixed: string,
  rule: string,
  options: Omit<LintOptions, "fix"> = {},
) {
  const result = await lintCode(code, options);
  expect(result.errored).toBe(true);
  expect(result.warnings).toEqual([
    expect.objectContaining({ rule, severity: "error" }),
  ]);

  const repaired = await lintCode(code, { ...options, fix: true });
  expect(repaired.code).toBe(fixed);
  expect(repaired.warnings).toEqual([]);
  expect((await lintCode(fixed, options)).warnings).toEqual([]);
}

describe("文件解析与推荐规则", () => {
  it.each([
    { filePath: "example.css", code: ".example { color: red; }" },
    {
      filePath: "example.scss",
      code: "$text-color: red;\n\n.example { color: $text-color; }",
    },
    {
      filePath: "nested/example.html",
      code: '<html><head><style>.example { color: red; }</style></head><body><div class="example"></div></body></html>',
    },
    {
      filePath: "nested/example.vue",
      code: '<script setup lang="ts">\nconst value: number = 1;\n</script>\n<template><div class="example">{{ value }}</div></template>\n<style scoped>\n.example { color: red; }\n</style>',
    },
  ])("允许合法的 $filePath", async ({ filePath, code }) => {
    const result = await lintCode(code, { filePath });

    expect(result.errored).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it.each([
    {
      name: "拒绝非法颜色值",
      rule: "color-no-invalid-hex",
      code: ".example { color: #ggg; }",
      filePath: "example.css",
    },
    {
      name: "拒绝未知属性",
      rule: "property-no-unknown",
      code: ".example { unknown-property: 1; }",
      filePath: "example.css",
    },
    {
      name: "校验 SCSS 变量命名",
      rule: "scss/dollar-variable-pattern",
      code: "$textColor: red;",
      filePath: "example.scss",
    },
    {
      name: "校验 HTML 样式块",
      rule: "color-no-invalid-hex",
      code: "<html><head><style>.example { color: #ggg; }</style></head><body></body></html>",
      filePath: "nested/example.html",
    },
    {
      name: "校验 Vue 样式块",
      rule: "property-no-unknown",
      code: '<template><div class="example" /></template>\n<style scoped>\n.example { unknown-property: 1; }\n</style>',
      filePath: "nested/example.vue",
    },
    {
      name: "校验 Vue 中的 SCSS 样式块",
      rule: "scss/dollar-variable-pattern",
      code: '<template><div /></template>\n<style lang="scss">\n$textColor: red;\n</style>',
      filePath: "nested/example.vue",
    },
  ])("$name", async ({ rule, code, filePath }) => {
    const result = await lintCode(code, { filePath });

    expect(result.errored).toBe(true);
    expect(result.warnings).toEqual([
      expect.objectContaining({ rule, severity: "error" }),
    ]);
  });

  it("允许 Vue 专用的伪类选择器", async () => {
    const result = await lintCode(
      '<template><div class="example" /></template>\n<style scoped>\n.example :deep(.child) { color: red; }\n\n:slotted(.item) { color: blue; }\n\n:global(.global) { color: green; }\n</style>',
      { filePath: "example.vue" },
    );

    expect(result.warnings).toEqual([]);
  });

  it.each([
    {
      name: "没有样式块的 Vue 组件",
      code: "<template><div /></template>",
    },
  ])("允许$name", async ({ code }) => {
    const result = await lintCode(code, { filePath: "example.vue" });

    expect(result.warnings).toEqual([]);
  });
});

describe("自定义规则校验", () => {
  it.each([
    {
      name: "允许空样式文件",
      rule: "no-empty-source",
      code: "",
      enabled: true,
    },
    {
      name: "允许跨平台标签选择器",
      rule: "selector-type-no-unknown",
      code: "custom-view { color: red; }",
      enabled: [true, { ignore: [] }],
    },
    {
      name: "不限制类名格式",
      rule: "selector-class-pattern",
      code: ".MyClass { color: red; }",
      enabled: "^[a-z][a-z0-9-]*$",
    },
    {
      name: "允许重复选择器",
      rule: "no-duplicate-selectors",
      code: ".example { color: red; }\n\n.example { color: blue; }",
      enabled: true,
    },
    {
      name: "允许图标字体不指定兜底字体",
      rule: "font-family-no-missing-generic-family-keyword",
      code: ".example { font-family: iconfont; }",
      enabled: true,
    },
  ])("$name，且重新启用规则后能够报错", async ({ rule, code, enabled }) => {
    expect((await lintCode(code)).warnings).toEqual([]);

    const result = await lintCode(code, { rules: { [rule]: enabled } });

    expect(result.errored).toBe(true);
    expect(result.warnings).toEqual([
      expect.objectContaining({ rule, severity: "error" }),
    ]);
  });
});

describe("自动修复", () => {
  it("修复标准 CSS 规则", async () => {
    await expectRuleFix(
      ".example { color: #ffffff; }",
      ".example { color: #fff; }",
      "color-hex-length",
    );
  });

  it.each([
    {
      filePath: "example.css",
      code: ".example {\n  color: red;\n  display: block;\n}",
      fixed: ".example {\n  display: block;\n  color: red;\n}",
    },
    {
      filePath: "example.scss",
      code: "$text-color: red;\n\n.example {\n  color: $text-color;\n  display: block;\n}",
      fixed:
        "$text-color: red;\n\n.example {\n  display: block;\n  color: $text-color;\n}",
    },
    {
      filePath: "nested/example.html",
      code: "<html><head><style>\n.example {\n  color: red;\n  display: block;\n}\n</style></head><body></body></html>",
      fixed:
        "<html><head><style>\n.example {\n  display: block;\n  color: red;\n}\n</style></head><body></body></html>",
    },
    {
      filePath: "nested/example.vue",
      code: '<template><div class="example" /></template>\n<style scoped>\n.example {\n  color: red;\n  display: block;\n}\n</style>',
      fixed:
        '<template><div class="example" /></template>\n<style scoped>\n.example {\n  display: block;\n  color: red;\n}\n</style>',
    },
    {
      filePath: "nested/example.vue",
      code: '<template><div class="example" /></template>\n<style scoped lang="scss">\n$text-color: red;\n\n.example {\n  color: $text-color;\n  display: block;\n}\n</style>',
      fixed:
        '<template><div class="example" /></template>\n<style scoped lang="scss">\n$text-color: red;\n\n.example {\n  display: block;\n  color: $text-color;\n}\n</style>',
    },
  ])(
    "按 Recess 顺序修复 $filePath 的属性",
    async ({ filePath, code, fixed }) => {
      await expectRuleFix(code, fixed, "order/properties-order", { filePath });
    },
  );
});
