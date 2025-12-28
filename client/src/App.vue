<template>
  <component :is="layout">
      <RouterView />
  </component>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { publicRoutes } from './router/index'

  import AppLayout from './components/layout/AppLayout.vue';

  const route = useRoute()

  const layout = computed(() => {
    const path = route.path
    if (publicRoutes.includes(path)) {
      return 'div'
    }
    return AppLayout
  })

</script>

<style>
  @import './assets/variables.css';
  html, body, #app {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
</style>
