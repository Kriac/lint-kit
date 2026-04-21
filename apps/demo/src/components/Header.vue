<script setup lang="ts">
defineProps<{
  activeTab: string;
}>();

defineEmits<{
  "tab-change": [tab: string];
}>();

const navItems = ["文档"];
</script>

<template>
  <header class="header">
    <nav class="nav">
      <div class="logo">
        <span class="logo-icon">⚙️</span>
        <span class="logo-text">Lint Kit</span>
      </div>
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item" class="nav-item">
          <a
            href="#"
            :class="{ active: activeTab === item }"
            @click.prevent="$emit('tab-change', item)"
          >
            {{ item }}
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgb(15 23 42 / 95%);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  padding: 1rem 2rem;
  margin: 0 auto;
}

.logo {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.logo-icon {
  font-size: 1.5rem;
}

.nav-list {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-item a {
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-item a:hover,
.nav-item a.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
</style>
