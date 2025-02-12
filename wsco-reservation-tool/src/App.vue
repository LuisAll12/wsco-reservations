<script setup>
  import NavBar from './components/NavBar.vue';
  import Footer from './components/Footer.vue';
</script>

<template>
  <NavBar />
  <router-view />
  <Footer />
</template>

<style scoped>
  @import './assets/css/global.css';
  body, html, template{
    margin: 0;
    padding: 0;
  }
  #app {
  margin: 0;
  padding: 0;
}
</style>
