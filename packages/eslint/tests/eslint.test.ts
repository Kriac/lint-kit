import type { PluginOptions } from "../src/types";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";
import createConfig from "../src/index";

const cwd = fileURLToPath(new URL("..", import.meta.url));

interface LintOptions extends PluginOptions {
  filePath?: string;
  fix?: boolean;
}

function createEslint(options?: Omit<LintOptions, "filePath">) {
  const { fix = false, ...config } = options ?? {};
  return new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: createConfig(options ? config : undefined),
    fix,
  });
}

async function lintCode(
  code: string,
  { filePath = "example.ts", ...options }: LintOptions = {},
) {
  const [result] = await createEslint(options).lintText(code, {
    filePath,
  });
  expect(result.fatalErrorCount).toBe(0);
  return result;
}

async function expectRuleFix(
  code: string,
  fixed: string,
  ruleId: string,
  options: Omit<LintOptions, "fix"> = {},
) {
  const result = await lintCode(code, options);
  expect(result.messages).toEqual([
    expect.objectContaining({ ruleId, severity: 2 }),
  ]);

  const repaired = await lintCode(code, { ...options, fix: true });
  expect(repaired.output).toBe(fixed);
  expect(repaired.messages).toEqual([]);
  expect((await lintCode(fixed, options)).messages).toEqual([]);
}

describe("默认配置", () => {
  it("不传选项和传入空选项时生效配置一致", async () => {
    const config = await createEslint().calculateConfigForFile("example.ts");

    for (const options of [{}, { configs: [], ignores: [] }]) {
      const eslint = createEslint(options);

      expect(await eslint.calculateConfigForFile("example.ts")).toEqual(config);
    }
  });
});

describe("自定义配置", () => {
  it("覆盖单条规则时保留其他默认规则", async () => {
    const result = await lintCode("debugger;\nexport const value = () => 1;", {
      configs: [{ rules: { "no-debugger": "off" } }],
    });

    expect(result.messages).toEqual([
      expect.objectContaining({ ruleId: "arrow-body-style", severity: 2 }),
    ]);
  });
});

describe("文件解析与推荐规则", () => {
  it.each([
    { filePath: "example.js", code: "export const value = 1;" },
    { filePath: "example.mjs", code: "export const value = 1;" },
    { filePath: "example.cjs", code: "module.exports = 1;" },
    {
      filePath: "example.ts",
      code: "export function identity(value: number): number { return value; }",
    },
    {
      filePath: "example.tsx",
      code: "export const render = () => { return <div />; };",
    },
    {
      filePath: "example.vue",
      code: '<script setup lang="ts">\nconst value = defineProps<{ count: number }>();\n</script>\n<template><div>{{ value.count }}</div></template>',
    },
  ])("允许合法的 $filePath", async ({ filePath, code }) => {
    const result = await lintCode(code, { filePath });

    expect(result.messages).toEqual([]);
  });

  it("在 Vue 模板中校验指令", async () => {
    const result = await lintCode(
      '<template><input v-model="1"  /></template>',
      { filePath: "example.vue" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "vue/valid-v-model", severity: 2 }),
      ]),
    );
  });

  it("在 Vue 的 TypeScript 脚本中执行 TS 规则", async () => {
    const result = await lintCode(
      '<script setup lang="ts">\nconst value: any = 1;\n</script>\n<template><div>{{ value }}</div></template>',
      { filePath: "example.vue" },
    );

    expect(result.messages).toEqual([
      expect.objectContaining({
        ruleId: "@typescript-eslint/no-explicit-any",
        severity: 2,
      }),
    ]);
  });
});

describe("忽略路径", () => {
  it.each([
    "node_modules/example/index.js",
    "nested/node_modules/example/index.js",
    "dist/example.ts",
    "nested/dist/example.ts",
  ])("默认忽略 %s", async (filePath) => {
    expect(await createEslint().isPathIgnored(filePath)).toBe(true);
  });

  it.each(["src/example.ts", "src/distribution/example.ts"])(
    "不忽略普通源文件 %s",
    async (filePath) => {
      expect(await createEslint().isPathIgnored(filePath)).toBe(false);
    },
  );

  it("自定义忽略目录时保留默认忽略，且不影响其他文件", async () => {
    const ignores = ["**/generated/**"];
    const configs = [{ rules: { "no-debugger": "off" as const } }];
    const eslint = createEslint({ configs, ignores });

    for (const filePath of [
      "generated/example.ts",
      "src/generated/example.ts",
      "dist/example.ts",
      "node_modules/example/index.js",
    ]) {
      expect(await eslint.isPathIgnored(filePath)).toBe(true);
    }
    expect(await eslint.isPathIgnored("src/example.ts")).toBe(false);
    expect(ignores).toEqual(["**/generated/**"]);
    expect(configs).toEqual([{ rules: { "no-debugger": "off" } }]);
  });
});

describe("自定义规则校验", () => {
  it.each([
    {
      name: "条件语句必须带大括号",
      ruleId: "curly",
      code: "export function check(value: boolean) { if (value) return true; return false; }",
      fixed:
        "export function check(value: boolean) { if (value) {return true;} return false; }",
    },
    {
      name: "多行条件语句必须带大括号",
      ruleId: "curly",
      code: "export function check(value: boolean) {\nif (value)\nreturn true;\nreturn false;\n}",
      fixed:
        "export function check(value: boolean) {\nif (value)\n{return true;}\nreturn false;\n}",
    },
    {
      name: "循环语句必须带大括号",
      ruleId: "curly",
      code: "export function drain(values: number[]) { while (values.length) values.pop(); }",
      fixed:
        "export function drain(values: number[]) { while (values.length) {values.pop();} }",
    },
    {
      name: "箭头函数必须使用块语句",
      ruleId: "arrow-body-style",
      code: 'export const greet = () => "hello";',
      fixed: 'export const greet = () => {return "hello"};',
    },
    {
      name: "仅用于类型的导入必须显式标记",
      ruleId: "@typescript-eslint/consistent-type-imports",
      code: 'import { Stats } from "node:fs";\nexport type FileStats = Stats;',
      fixed:
        'import type { Stats } from "node:fs";\nexport type FileStats = Stats;',
    },
  ])("$name，并支持自动修复", async ({ ruleId, code, fixed }) => {
    await expectRuleFix(code, fixed, ruleId);
  });

  it.each([
    {
      name: "JavaScript 中的未声明全局变量交由类型检查处理",
      ruleId: "no-undef",
      filePath: "example.js",
      code: "export const value = externalGlobal;",
    },
    {
      name: "TypeScript 中的未声明全局变量交由类型检查处理",
      ruleId: "no-undef",
      filePath: "example.ts",
      code: "export const value = externalGlobal;",
    },
    {
      name: "允许空的 Vue 模板根节点",
      ruleId: "vue/valid-template-root",
      filePath: "example.vue",
      code: "<template></template>",
    },
    {
      name: "允许 Vue 页面使用单单词组件名",
      ruleId: "vue/multi-word-component-names",
      filePath: "Page.vue",
      code: "<template><div /></template>",
    },
  ])("$name", async ({ ruleId, filePath, code }) => {
    expect((await lintCode(code, { filePath })).messages).toEqual([]);

    const result = await lintCode(code, {
      filePath,
      configs: [{ rules: { [ruleId]: "error" } }],
    });

    expect(result.messages).toEqual([
      expect.objectContaining({ ruleId, severity: 2 }),
    ]);
  });
});

describe("Perfectionist 排序规则", () => {
  it.each([
    {
      name: "导入属性按字母顺序排列",
      ruleId: "perfectionist/sort-named-imports",
      code: 'import { z, alphabet } from "example";\nexport { alphabet, z };',
      fixed: 'import { alphabet, z } from "example";\nexport { alphabet, z };',
    },
    {
      name: "导出属性按字母顺序排列",
      ruleId: "perfectionist/sort-named-exports",
      code: "const alphabet = 1;\nconst z = 2;\nexport { z, alphabet };",
      fixed: "const alphabet = 1;\nconst z = 2;\nexport { alphabet, z };",
    },
    {
      name: "联合类型按字母顺序排列",
      ruleId: "perfectionist/sort-union-types",
      code: 'export type Value = "z" | "alphabet";',
      fixed: 'export type Value = "alphabet" | "z";',
    },
    {
      name: "交叉类型按字母顺序排列",
      ruleId: "perfectionist/sort-intersection-types",
      code: "interface Alphabet { alpha: string }\ninterface Z { zebra: number }\nexport type Value = Z & Alphabet;",
      fixed:
        "interface Alphabet { alpha: string }\ninterface Z { zebra: number }\nexport type Value = Alphabet & Z;",
    },
    {
      name: "对象类型属性按字母顺序排列",
      ruleId: "perfectionist/sort-object-types",
      code: "export function identity(value: { z: string; alphabet: number }) { return value; }",
      fixed:
        "export function identity(value: { alphabet: number; z: string; }) { return value; }",
    },
    {
      name: "接口属性按字母顺序排列",
      ruleId: "perfectionist/sort-interfaces",
      code: "export interface Value { z: string; alphabet: number; }",
      fixed: "export interface Value { alphabet: number; z: string; }",
    },
  ])("$name，并支持自动修复", async ({ ruleId, code, fixed }) => {
    await expectRuleFix(code, fixed, ruleId);
  });

  it("导入方式优先于路径分组，路径按内置、外部、内部、父级、本级排序", async () => {
    const imports = [
      'import type { Stats } from "node:fs";',
      'import { readFile } from "node:fs";',
      'import { external } from "external";',
      'import { internal } from "~/internal";',
      'import { parent } from "../parent";',
      'import { sibling } from "./sibling";',
      'import * as namespace from "namespace";',
      'import defaultValue from "node:path";',
    ];
    const usage =
      "export type FileStats = Stats;\nexport { defaultValue, external, internal, namespace, parent, readFile, sibling };";
    const sorted = `${imports.join("\n")}\n${usage}`;
    const reversed = `${[...imports].reverse().join("\n")}\n${usage}`;

    expect((await lintCode(sorted)).messages).toEqual([]);
    const result = await lintCode(reversed);

    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages).toEqual(
      result.messages.map(() => {
        return expect.objectContaining({
          ruleId: "perfectionist/sort-imports",
          severity: 2,
        });
      }),
    );

    const repaired = await lintCode(reversed, { fix: true });

    expect(repaired.output).toBe(sorted);
    expect(repaired.messages).toEqual([]);
  });

  it("同组导入按行长度升序，并支持自动修复", async () => {
    await expectRuleFix(
      'import aLonger from "long-package-name";\nimport z from "z";\nexport { aLonger, z };',
      'import z from "z";\nimport aLonger from "long-package-name";\nexport { aLonger, z };',
      "perfectionist/sort-imports",
    );
  });

  it("保留副作用导入的执行顺序", async () => {
    const code = 'import "z-side-effect";\nimport "a-side-effect";';
    const result = await lintCode(code, { fix: true });

    expect(result.output).toBeUndefined();
    expect(result.messages).toEqual([]);
  });

  it("移除导入分组之间的空行", async () => {
    await expectRuleFix(
      'import { readFile } from "node:fs";\n\nimport path from "node:path";\nexport { path, readFile };',
      'import { readFile } from "node:fs";\nimport path from "node:path";\nexport { path, readFile };',
      "perfectionist/sort-imports",
    );
  });
});
