<script setup lang="ts">
const handleGetStarted = () => {
  window.open("https://kriac.github.io/lint-kit/", "_blank");
};
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">统一的 Lint 配置集合</h1>
      <p class="hero-subtitle">
        为 Vue3 + TypeScript 项目提供开箱即用的 ESLint、Stylelint、Commitlint
        配置
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="handleGetStarted">
          快速开始
        </button>
        <a
          href="https://github.com/kriac/lint-kit"
          target="_blank"
          class="btn btn-secondary"
        >
          在 GitHub 上查看
        </a>
      </div>
    </div>
    <div class="hero-visual">
      <div
        v-for="i in 3"
        :key="i"
        class="visual-circle"
        :style="{
          '--index': i,
        }"
      ></div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 600px;
  padding: 4rem 0;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  overflow: hidden;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  color: white;
  background: var(--primary);
  box-shadow: 0 4px 15px rgb(16 185 129 / 25%);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  color: var(--primary);
  background: transparent;
  border: 2px solid var(--primary);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgb(183 255 231 / 8.9%);
}

.hero-visual {
  position: relative;
  height: 400px;
}

.visual-circle {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.visual-circle:nth-child(1) {
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  border-color: var(--primary);
  animation-delay: 0s;
}

.visual-circle:nth-child(2) {
  bottom: 50px;
  left: 50px;
  width: 200px;
  height: 200px;
  border-color: var(--secondary);
  animation-delay: 1s;
}

.visual-circle:nth-child(3) {
  top: 100px;
  left: 150px;
  width: 150px;
  height: 150px;
  border-color: var(--accent);
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@media (width <= 768px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 2rem 0;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
