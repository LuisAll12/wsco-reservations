<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const isSidebarOpen = ref(true)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function handleResize() {
  isSidebarOpen.value = window.innerWidth >= 768
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="relative min-h-screen bg-gray-100">
    <!-- Toggle Button (immer sichtbar, mittig) -->
    <div class="fixed z-50 top-1/2 -translate-y-1/2 left-2">
      <button
        @click="toggleSidebar"
        class="bg-slate-800 text-white p-2 rounded-full shadow-lg"
      >
        <span v-if="!isSidebarOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- Layout -->
    <div class="flex">
      <Sidebar :open="isSidebarOpen" />
      <main class="flex-1 p-4 transition-all duration-300 ease-in-out">
        <router-view />
      </main>
    </div>
  </div>
</template>
