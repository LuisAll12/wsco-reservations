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

import { defineProps, ref } from 'vue'
import router from '../router/router'
import { logoutUser } from '../services/auth'

const props = defineProps({ open: Boolean })
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
    class="bg-slate-800 text-white h-screen z-40 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden fixed md:static"
    :class="props.open ? 'w-64 md:w-72' : 'w-14 md:w-20'"
  >
    <!-- Header -->
    <div class="border-b border-slate-700 p-4 flex justify-center md:justify-start">
      <span v-if="props.open" class="text-lg font-semibold">WSCO Reservationen</span>
      <span v-else class="text-sm font-bold">WS</span>
    </div>

    <!-- Navigation Items -->
    <nav class="mt-4 flex-1 space-y-1 text-sm">
      <router-link to="/dashboard" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <HomeIcon class="icon" />
        <span v-if="props.open">Dashboard</span>
      </router-link>

      <router-link to="/dashboard/schaden-melden" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <ExclamationTriangleIcon class="icon" />
        <span v-if="props.open">Schaden melden</span>
      </router-link>

      <router-link to="/dashboard/unsere-boote" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <LifebuoyIcon class="icon" />
        <span v-if="props.open">Unsere Boote</span>
      </router-link>

      <router-link to="/dashboard/meine-reservierungen" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <UserCircleIcon class="icon" />
        <span v-if="props.open">Meine Reservierungen</span>
      </router-link>

      <router-link v-if="isAdmin" to="/dashboard/admin" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <WrenchScrewdriverIcon class="icon" />
        <span v-if="props.open">Admin Dashboard</span>
      </router-link>

      <router-link to="/dashboard/hilfe" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <QuestionMarkCircleIcon class="icon" />
        <span v-if="props.open">Hilfe</span>
      </router-link>

      <router-link to="/dashboard/settings" class="sidebar-link" :class="{ 'justify-center': !props.open }">
        <Cog6ToothIcon class="icon" />
        <span v-if="props.open">Einstellungen</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="px-4 pb-4">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
        :class="{ 'justify-center': !props.open }"
      >
        <ArrowLeftOnRectangleIcon class="icon" />
        <span v-if="props.open">Ausloggen</span>
      </button>

      <div v-if="props.open" class="mt-4 text-xs text-slate-400 border-t border-slate-700 pt-3 space-y-2">
        <a href="/impressum" target="_blank" class="block hover:underline hover:text-slate-200">Impressum ↗</a>
        <a href="/datenschutz" target="_blank" class="block hover:underline hover:text-slate-200">Datenschutz ↗</a>
        <a href="/agb" target="_blank" class="block hover:underline hover:text-slate-200">Reservierungs-AGB ↗</a>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #cbd5e1;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}
.sidebar-link:hover {
  background-color: #475569;
}
</style>
