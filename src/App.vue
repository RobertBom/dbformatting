<script setup>
import deDE from 'ant-design-vue/es/locale/de_DE';
</script>

<template>
  <a-config-provider :locale="deDE">
    <MainLayout></MainLayout>
  </a-config-provider>
</template>

<script>
import MainLayout from './components/MainLayout.vue'

export default {
  name: 'App',
  components: {
    MainLayout
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>