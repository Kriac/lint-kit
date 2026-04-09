import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Lint Kit",
  description: "一个基于社区实践的 lint 配置集合，为前端项目提供统一的配置。",
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
        items: [
          {
            text: "快速开始",
            link: "/guide/getting-started",
          },
        ],
      },
      {
        text: "配置",
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
        items: [
          {
            text: "IDE 支持",
            link: "/guide/ide",
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
  },
});
