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
import { useRouter } from 'vue-router'
import { logoutUser } from '../services/auth'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['toggle'])

const router = useRouter()
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

      <!-- Navigation -->
      <nav class="mt-4 px-2 space-y-1 text-sm">
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <HomeIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Dashboard</span>
        </router-link>

        <router-link to="/dashboard/schaden-melden" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <ExclamationTriangleIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Schaden melden</span>
        </router-link>

        <router-link to="/dashboard/unsere-boote" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <LifebuoyIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Unsere Boote</span>
        </router-link>

        <router-link to="/dashboard/meine-reservierungen" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <UserCircleIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Meine Reservierungen</span>
        </router-link>

        <router-link v-if="isAdmin" to="/dashboard/admin" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <WrenchScrewdriverIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Admin Dashboard</span>
        </router-link>

        <router-link to="/dashboard/hilfe" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <QuestionMarkCircleIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Hilfe</span>
        </router-link>

        <router-link to="/dashboard/settings" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition font-medium">
          <Cog6ToothIcon class="w-6 h-6 text-slate-300" />
          <span v-if="open">Einstellungen</span>
        </router-link>
      </nav>
    </div>

    <!-- Footer -->
    <div class="px-4 pb-4">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5 text-slate-300" />
        <span v-if="open">Ausloggen</span>
      </button>

      <div class="mt-4 text-xs text-slate-400 border-t border-slate-700 pt-3 space-y-1">
        <router-link v-if="open" to="/impressum" class="block hover:underline hover:text-slate-200">Impressum ↗</router-link>
        <router-link v-if="open" to="/datenschutz" class="block hover:underline hover:text-slate-200">Datenschutz ↗</router-link>
        <router-link v-if="open" to="/agb" class="block hover:underline hover:text-slate-200">Reservierungs-AGB ↗</router-link>
      </div>
    </div>
  </aside>
</template>
