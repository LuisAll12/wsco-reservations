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
    :class="[open ? 'w-64 md:w-72' : 'w-0 md:w-20']"
  >
    <!-- Header -->
    <div>
      <div class="relative px-6 py-4 border-b border-slate-700">
        <h1 class="text-lg font-semibold whitespace-nowrap">WSCO Reservationen</h1>
        <button v-if="open" class="absolute right-4 top-4 md:hidden" @click="emit('toggle')">✕</button>
      </div>

      <nav class="mt-4 px-4 space-y-2 text-sm">
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <HomeIcon class="w-5 h-5 text-slate-300" /> Dashboard
        </router-link>
        <router-link to="/dashboard/schaden-melden" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <ExclamationTriangleIcon class="w-5 h-5 text-slate-300" /> Schaden melden
        </router-link>
        <router-link to="/dashboard/unsere-boote" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <LifebuoyIcon class="w-5 h-5 text-slate-300" /> Unsere Boote
        </router-link>
        <router-link to="/dashboard/meine-reservierungen" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <UserCircleIcon class="w-5 h-5 text-slate-300" /> Meine Reservierungen
        </router-link>
        <router-link v-if="isAdmin" to="/dashboard/admin" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <WrenchScrewdriverIcon class="w-5 h-5 text-slate-300" /> Admin Dashboard
        </router-link>
        <router-link to="/dashboard/hilfe" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <QuestionMarkCircleIcon class="w-5 h-5 text-slate-300" /> Hilfe
        </router-link>
        <router-link to="/dashboard/settings" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition">
          <Cog6ToothIcon class="w-5 h-5 text-slate-300" /> Einstellungen
        </router-link>
      </nav>
    </div>

    <!-- Footer -->
    <div class="px-4 pb-4">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5 text-slate-300" /> Ausloggen
      </button>

      <div class="mt-4 text-xs text-slate-400 border-t border-slate-700 pt-3 space-y-2">
        <a href="/impressum" target="_blank" class="block hover:underline hover:text-slate-200">Impressum ↗</a>
        <a href="/datenschutz" target="_blank" class="block hover:underline hover:text-slate-200">Datenschutz ↗</a>
        <a href="/agb" target="_blank" class="block hover:underline hover:text-slate-200">Reservierungs-AGB ↗</a>
      </div>
    </div>
  </aside>
</template>
