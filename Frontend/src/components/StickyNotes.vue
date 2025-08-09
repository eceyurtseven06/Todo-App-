<template>
  <div class="note" :style="{ backgroundColor: color }">
    <h3>{{ title }}</h3>
    <p>{{ content }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  content: string
  color: string
}>()
</script>

<style scoped>
.note {
  padding: 20px;
  border-radius: 10px;
  color: #222;
  width: 250px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>
