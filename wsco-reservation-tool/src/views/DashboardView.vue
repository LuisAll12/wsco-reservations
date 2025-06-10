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
    <!-- Toggle Button (immer sichtbar) -->
    <button
      @click="toggleSidebar"
      class="fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-full shadow-lg"
    >
      <span v-if="!isSidebarOpen">☰</span>
      <span v-else>✕</span>
    </button>

    <div class="flex">
      <Sidebar :open="isSidebarOpen" @toggle="toggleSidebar" />
      <main class="flex-1 p-4 transition-all duration-300 ease-in-out">
        <router-view />
      </main>
    </div>
  </div>
</template>
