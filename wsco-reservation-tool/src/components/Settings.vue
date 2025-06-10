<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref({
  name: '',
  email: '',
  joined: ''
})
const localData = ref('')
const cookieData = ref('')

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  user.value.name = userData.name || 'Unbekannt'
  user.value.email = userData.email || 'Keine E-Mail'
  user.value.joined = userData.joined || 'Unbekannt'
})

function goBack() {
  router.push('/dashboard')
}

function logout() {
  localStorage.removeItem('auth_token')
  router.push('/login')
}

function clearLocalStorage() {
  localStorage.clear()
  alert('Lokaler Speicher wurde gelöscht.')
  location.reload()
}

function showLocalStorage() {
  localData.value = JSON.stringify(localStorage, null, 2)
}

function showCookies() {
  cookieData.value = document.cookie
}

function deleteAccount() {
  if (confirm('Möchtest du deinen Account wirklich löschen? Dieser Vorgang ist nicht umkehrbar.')) {
    localStorage.clear()
    document.cookie = 'auth_token=; Max-Age=0; path=/;'
    alert('Account gelöscht.')
    router.push('/login')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10 text-slate-800 bg-white rounded-lg shadow-md mt-6">
    <div class="mb-6">
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-5 py-2 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition"
      >
        ⬅ Zurück zum Dashboard
      </button>
    </div>

    <h1 class="text-3xl font-bold mb-8 text-center">Einstellungen</h1>

    <!-- Allgemein -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-3">Allgemein</h2>
      <div class="bg-slate-100 rounded-md p-4">
        <p class="mb-2"><strong>Name:</strong> {{ user.name }}</p>
        <p class="mb-2"><strong>E-Mail:</strong> {{ user.email }}</p>
        <p><strong>Beigetreten:</strong> {{ user.joined }}</p>
      </div>
    </section>

    <!-- Datenschutz -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-3">Datenschutz</h2>
      <div class="space-y-3">
        <button @click="showLocalStorage" class="settings-btn">Lokale Daten anzeigen</button>
        <button @click="clearLocalStorage" class="settings-btn">Lokale Daten löschen</button>
        <button @click="showCookies" class="settings-btn">Cookies anzeigen</button>
        <router-link to="/datenschutz" class="settings-btn">Datenschutzerklärung öffnen</router-link>
        <router-link to="/impressum" class="settings-btn">Impressum öffnen</router-link>
      </div>
    </section>

    <!-- Account -->
    <section>
      <h2 class="text-xl font-semibold mb-3">Account</h2>
      <div class="space-y-3">
        <button disabled class="settings-btn opacity-50 cursor-not-allowed">Profilbild ändern (bald verfügbar)</button>
        <button @click="deleteAccount" class="settings-btn bg-red-600 hover:bg-red-700 text-white">Konto löschen</button>
        <button @click="logout" class="settings-btn bg-slate-800 text-white hover:bg-slate-700">Logout</button>
      </div>
    </section>

    <!-- Datenanzeige -->
    <div v-if="localData" class="mt-10 text-sm bg-slate-100 p-4 rounded-lg whitespace-pre-wrap break-words">
      <strong>Lokale Daten:</strong>
      <pre>{{ localData }}</pre>
    </div>

    <div v-if="cookieData" class="mt-10 text-sm bg-slate-100 p-4 rounded-lg whitespace-pre-wrap break-words">
      <strong>Cookies:</strong>
      <pre>{{ cookieData }}</pre>
    </div>
  </div>
</template>

<style scoped>
.settings-btn {
  display: block;
  width: 100%;
  text-align: left;
  background-color: #f1f5f9;
  color: #1e293b;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  font-weight: 500;
}
.settings-btn:hover {
  background-color: #e2e8f0;
}
</style>
