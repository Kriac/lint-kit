<p align="center">
  <img src="./apps/docs/public/brand/logo-light.svg" alt="Lint Kit" width="112">
</p>

<h1 align="center">Lint Kit</h1>

<p align="center">面向 TS 项目的代码检查工具集合</p>

## 特征

- **内置工具**：项目本身无需安装 ESLint、Stylelint、Prettier 和 Commitlint
- **统一命令**：全局统一检查命令，维护更加省心
- **优先遵循标准规则**：所有检查工具都优先遵循各个语法的标准规则，尽可能的减少风格争论

## 快速开始

在项目根目录执行：

```bash
pnpm add -D @kriac/lint-kit
pnpm lint-kit init
pnpm lint-kit check
```

`init` 会引导选择工具并生成缺失的配置文件。日常检查使用 `pnpm lint-kit check --fix` 自动修复即可。

## 文档

请参考 [入门指南](https://kriac.github.io/lint-kit/guide/getting-started)

## 贡献

首先感谢你考虑为本项目做出贡献！我们欢迎社区成员的贡献，以帮助改进和扩展本项目。

## 执照

本项目采用 MIT 许可证，详细内容请见 [LICENSE](LICENSE) 文件。
