<script setup lang="ts">
import type { Stat } from "../types";

defineProps<{
  stats: Stat[];
}>();
</script>

<template>
  <section class="stats">
    <div v-for="stat in stats" :key="stat.label" class="stat-item">
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 4rem 0;
  border-top: 1px solid var(--border);
}

.stat-item {
  position: relative;
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(
    160deg,
    rgb(17 27 46 / 78%) 0%,
    rgb(14 24 42 / 72%) 100%
  );
  border: 1px solid var(--border);
  border-radius: 0.85rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #dbe6f6;
}

@media (width <= 768px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
