<template>
  <div class="login-page">
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue';
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-width: 100vw;
}
</style>
