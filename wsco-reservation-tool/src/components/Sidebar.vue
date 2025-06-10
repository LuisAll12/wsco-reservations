<script setup>
import {
  HomeIcon,
  ExclamationTriangleIcon,
  LifebuoyIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'

import { defineProps, defineEmits, ref } from 'vue'
import router from '../router/router'
import { logoutUser } from '../services/auth'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['toggle'])

const isAdmin = ref(router.hasRoute('admin'))

async function logout() {
  try {
    await logoutUser()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <aside
    class="bg-slate-800 text-white fixed md:static h-screen z-40 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden"
    :class="[open ? 'w-64 md:w-72' : 'w-14 md:w-20']"
  >
    <!-- Header -->
    <div>
      <div class="px-4 py-4 border-b border-slate-700 flex items-center justify-between">
        <h1 v-if="open" class="text-lg font-semibold whitespace-nowrap">WSCO Reservationen</h1>
        <span v-else class="text-sm font-bold tracking-wide">WS</span>
      </div>

      <nav class="mt-4 px-2 space-y-1 text-sm">
        <router-link to="/dashboard" class="sidebar-link">
          <HomeIcon class="sidebar-icon" /> <span v-if="open">Dashboard</span>
        </router-link>
        <router-link to="/dashboard/schaden-melden" class="sidebar-link">
          <ExclamationTriangleIcon class="sidebar-icon" /> <span v-if="open">Schaden melden</span>
        </router-link>
        <router-link to="/dashboard/unsere-boote" class="sidebar-link">
          <LifebuoyIcon class="sidebar-icon" /> <span v-if="open">Unsere Boote</span>
        </router-link>
        <router-link to="/dashboard/meine-reservierungen" class="sidebar-link">
          <UserCircleIcon class="sidebar-icon" /> <span v-if="open">Meine Reservierungen</span>
        </router-link>
        <router-link v-if="isAdmin" to="/dashboard/admin" class="sidebar-link">
          <WrenchScrewdriverIcon class="sidebar-icon" /> <span v-if="open">Admin Dashboard</span>
        </router-link>
        <router-link to="/dashboard/hilfe" class="sidebar-link">
          <QuestionMarkCircleIcon class="sidebar-icon" /> <span v-if="open">Hilfe</span>
        </router-link>
        <router-link to="/dashboard/settings" class="sidebar-link">
          <Cog6ToothIcon class="sidebar-icon" /> <span v-if="open">Einstellungen</span>
        </router-link>
      </nav>
    </div>

    <!-- Footer -->
    <div class="px-4 pb-4">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
      >
        <ArrowLeftOnRectangleIcon class="sidebar-icon" /> <span v-if="open">Ausloggen</span>
      </button>

      <div class="mt-4 text-xs text-slate-400 border-t border-slate-700 pt-3 space-y-1">
        <a v-if="open" href="/impressum" target="_blank" class="block hover:underline hover:text-slate-200">Impressum ↗</a>
        <a v-if="open" href="/datenschutz" target="_blank" class="block hover:underline hover:text-slate-200">Datenschutz ↗</a>
        <a v-if="open" href="/agb" target="_blank" class="block hover:underline hover:text-slate-200">Reservierungs-AGB ↗</a>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-link {
  @apply flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium;
}
.sidebar-icon {
  @apply w-5 h-5 text-slate-300;
}
</style>
