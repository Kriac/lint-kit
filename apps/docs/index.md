---
layout: home

hero:
  name: Lint Kit
  text: 一套基于社区实践的 lint 配置集合
  tagline: 为 Vue3 + TS 项目提供开箱即用的 ESLint、Stylelint、Commitlint 配置。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/kriac/lint-kit

features:
  - icon: 🔍
    title: ESLint
    details: 预配置的 ESLint 规则集，支持 Vue、TypeScript，开箱即用。
    link: /guide/eslint
    linkText: 查看配置
  - icon: 🎨
    title: Stylelint
    details: 统一的 CSS / SCSS 样式规范，支持 Vue 单文件组件。
    link: /guide/stylelint
    linkText: 查看配置
  - icon: 📝
    title: Commitlint
    details: 规范化 Git 提交信息，内置 czg 交互式提交支持。
    link: /guide/commitlint
    linkText: 查看配置
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
}

.VPHero {
  padding: 18px;
  filter: drop-shadow(-2px 4px 6px rgb(0 0 0 / 20%));
}
</style>
