<p align="center">
  <img src="./apps/docs/public/brand/logo-light.svg#gh-light-mode-only" alt="Lint Kit" width="112">
  <img src="./apps/docs/public/brand/logo-dark.svg#gh-dark-mode-only" alt="Lint Kit" width="112">
</p>

<h1 align="center">Lint Kit</h1>

<p align="center">一款可组合的代码质量工具集</p>

## 特征

- **统一命令**: 一套命令即可完成代码风格检查、格式化与提交信息的校验
- **内置工具**: 由 lint-kit 统一管理 ESLint、Stylelint 等代码检查工具的版本，无需单独维护和选择工具
- **按需选择**: 支持按需组合检查工具与规则预设，灵活适配不同项目
- **最佳实践**: 在遵循各语法推荐的规则基础上，我们还内置了代码排序规则，用于提升代码可读性与团队协作效率

## 使用

在项目根目录执行：

```bash
pnpm add -D @kriac/lint-kit
pnpm lint-kit init
pnpm lint-kit check
```

`init` 会引导选择工具并生成缺失的配置文件。日常检查使用 `pnpm lint-kit check --fix` 自动修复即可。

## 文档

请参考[快速开始](https://kriac.github.io/lint-kit/guide/getting-started)

## 贡献

首先感谢你考虑为本项目做出贡献！我们欢迎社区成员的贡献，以帮助改进和扩展本项目。

## 执照

本项目采用 MIT 许可证，详细内容请见 [LICENSE](LICENSE) 文件。
