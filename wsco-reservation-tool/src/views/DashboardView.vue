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
  <div class="relative min-h-screen bg-gray-100 flex">
    <Sidebar :open="isSidebarOpen" @toggle="toggleSidebar" />

    <!-- Toggle Button zwischen Sidebar und Main -->
    <div
      class="absolute top-4 z-50 transition-all duration-300"
      :class="isSidebarOpen ? 'left-[270px]' : 'left-[60px]'"
    >
      <button
        @click="toggleSidebar"
        class="bg-slate-700 text-white p-2 rounded-full shadow-lg"
      >
        <span v-if="!isSidebarOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-4 transition-all duration-300 ease-in-out">
      <router-view />
    </main>
  </div>
</template>
