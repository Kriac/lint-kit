import config from "@kriac/commitlint-config";

export default config({
  scopes: [
    {
      name: "kit: 聚合配置",
      value: "kit",
    },
    {
      name: "commitlint: 提交配置",
      value: "commitlint",
    },
    {
      name: "eslint: 代码配置",
      value: "eslint",
    },
    {
      name: "stylelint: 样式配置",
      value: "stylelint",
    },
  ],
});
