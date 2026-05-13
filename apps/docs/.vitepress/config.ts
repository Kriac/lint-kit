import { defineConfig } from "vitepress";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = isGithubActions && repo ? `/${repo}/` : "/";

export default defineConfig({
  base,
  title: "Lint Kit",
  description:
    "一个基于社区实践的个人 lint 配置集合，旨在为 vue3 + ts 项目提供统一的配置。",
  lang: "zh-CN",
  themeConfig: {
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
        text: "介绍",
        collapsed: false,
        items: [
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
        text: "配置",
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
        text: "推荐",
        collapsed: false,
        items: [
          {
            text: "IDE 支持",
            link: "/guide/ide",
          },
          {
            text: "社区项目",
            link: "/guide/community",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kriac/lint-kit",
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
