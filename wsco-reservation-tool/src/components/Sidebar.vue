<template>
  <div class="flex h-screen">
    <!-- Sidebar Toggle Button (visible on mobile and when closed) -->
    <button
      class="fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-full shadow-lg"
      @click="toggleSidebar"
    >
      <span v-if="!isSidebarOpen">☰</span>
      <span v-else>✕</span>
    </button>

    <!-- Sidebar -->
      <aside
        :class="[
          'bg-slate-800 text-white flex flex-col justify-between transition-all duration-300 shadow-lg z-40 h-screen',
          isSidebarOpen ? 'w-64 md:w-72' : 'w-0 md:w-20',
          'fixed md:relative'
        ]"
      >
      <!-- Header with space for close button -->
      <div>
        <div class="relative px-6 py-4 border-b border-slate-700">
          <h1 class="text-lg font-semibold tracking-wide text-white whitespace-nowrap">
            WSCO Reservationen
          </h1>
          <button
            v-if="isSidebarOpen"
            class="absolute right-4 top-4 md:hidden text-white p-1"
            @click="isSidebarOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Navigation Items -->
        <nav class="mt-4 flex-1 px-4 space-y-2 text-sm">
          <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <HomeIcon class="w-5 h-5 text-slate-300" /> Dashboard
          </router-link>

          <router-link to="/dashboard/schaden-melden" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <ExclamationTriangleIcon class="w-5 h-5 text-slate-300" /> Schaden melden
          </router-link>

          <router-link to="/dashboard/unsere-boote" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <LifebuoyIcon class="w-5 h-5 text-slate-300" /> Unsere Boote
          </router-link>

          <router-link to="/dashboard/meine-reservierungen" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <UserCircleIcon class="w-5 h-5 text-slate-300" /> Meine Reservierungen
          </router-link>

          <router-link v-if="isAdmin" to="/dashboard/admin" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <WrenchScrewdriverIcon class="w-5 h-5 text-slate-300" /> Admin Dashboard
          </router-link>

          <router-link to="/dashboard/hilfe" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <QuestionMarkCircleIcon class="w-5 h-5 text-slate-300" /> Hilfe
          </router-link>

          <router-link to="/dashboard/settings" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 font-medium transition">
            <Cog6ToothIcon class="w-5 h-5 text-slate-300" /> Einstellungen
          </router-link>
        </nav>
      </div>

      <!-- Footer -->
      <div class="px-4 pb-4">
        <button
          class="w-full flex items-center gap-2 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md"
          @click="logout"
        >
          <ArrowLeftOnRectangleIcon class="w-5 h-5 text-slate-300" /> Ausloggen
        </button>

        <div class="mt-4 text-xs text-slate-400 border-t border-slate-700 pt-3 space-y-2">
          <a href="/impressum" class="block hover:underline hover:text-slate-200 transition" target="_blank" rel="noopener">Impressum ↗</a>
          <a href="/datenschutz" class="block hover:underline hover:text-slate-200 transition" target="_blank" rel="noopener">Datenschutz ↗</a>
          <a href="/agb" class="block hover:underline hover:text-slate-200 transition" target="_blank" rel="noopener">Reservierungs-AGB ↗</a>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div :class="isSidebarOpen ? 'ml-64 md:ml-72' : 'ml-0 md:ml-20'" class="transition-all duration-300 flex-1">
      <slot />
    </div>
  </div>
</template>

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
import { ref } from 'vue'
import { authCheck, logoutUser } from '../services/auth';
import router from '../router/router';

const props = defineProps({
  user: Object,
  isSidebarOpen: Boolean
})
const emit = defineEmits(['update:isSidebarOpen'])


const isAdmin = ref(router.hasRoute('admin'));
const isLoggedin = async () => await authCheck();
const isSidebarOpen = ref(true);


function toggleSidebar() {
  emit('update:isSidebarOpen', !props.isSidebarOpen)
}

const logout = async () => {
  try {
    await logoutUser();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>
