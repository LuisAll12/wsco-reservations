<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';

const router = useRouter();
const hasSessionKey = ref(false);

// Prüft, ob ein Session-Key-Cookie existiert
const checkSessionKey = () => {
  hasSessionKey.value = !!Cookies.get('sessionKey');
};

// Initialprüfung beim Laden der Komponente
onMounted(() => {
  checkSessionKey();

  // Optional: Event-Listener für Änderungen (falls du später manuell Cookies löschst)
  window.addEventListener('sessionKeyChanged', checkSessionKey);
});
</script>

<template>
  <router-view />
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
