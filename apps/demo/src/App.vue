<script setup lang="ts">
// if 语句即使只有一行也必须使用花括号
const isTrue = true;
if (isTrue) {
  console.log(1);
}

// 箭头函数必须使用完整写法，即使是简单的映射
const arr = [1, 2, 3, 4];
arr.map((item) => {
  return item.toFixed();
});
</script>

<template>
  <div class="hero">
    <div class="content">Hello world!</div>
  </div>
</template>

<style scoped lang="scss">
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.content {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}
</style>
