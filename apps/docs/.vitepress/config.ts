import { defineConfig } from "vitepress";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = isGithubActions && repo ? `/${repo}/` : "/";

export default defineConfig({
  base,
  title: "Lint Kit",
  description: "用同一套命令运行内置的检查工具，开箱即用！",
  lang: "zh-CN",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: `${base}brand/logo-light.svg`,
        type: "image/svg+xml",
      },
    ],
  ],
  themeConfig: {
    logo: {
      light: "/brand/logo-light.svg",
      dark: "/brand/logo-dark.svg",
    },
    siteTitle: "Lint Kit",
    search: {
      provider: "local",
    },
    nav: [
      {
        text: "指南",
        link: "/guide/getting-started",
      },
    ],
    sidebar: [
      {
        text: "开始使用",
        collapsed: false,
        items: [
          {
            text: "介绍",
            link: "/guide/introduction",
          },
          {
            text: "快速开始",
            link: "/guide/getting-started",
          },
          {
            text: "工作流集成",
            link: "/guide/workflow",
          },
        ],
      },
      {
        text: "工具配置",
        collapsed: false,
        items: [
          {
            text: "ESLint",
            link: "/guide/eslint",
          },
          {
            text: "Stylelint",
            link: "/guide/stylelint",
          },
          {
            text: "Commitlint",
            link: "/guide/commitlint",
          },
        ],
      },
      {
        text: "更多信息",
        collapsed: false,
        items: [
          {
            text: "命令与配置",
            link: "/guide/reference",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Kriac/lint-kit",
      },
    ],
    outline: {
      label: "本页目录",
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    footer: {
      copyright: "Copyright © 2024-present Kriac. All rights reserved.",
      message: "Released under the MIT License.",
    },
  },
});
