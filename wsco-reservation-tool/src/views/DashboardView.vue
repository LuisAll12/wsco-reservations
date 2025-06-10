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
    <div class="flex">
      <Sidebar :open="isSidebarOpen" @toggle="toggleSidebar" />

      <!-- Main Content -->
      <div class="flex-1 relative">
        <!-- Toggle Button in der Mitte zwischen Sidebar und Content -->
        <div
          class="absolute z-40 top-4 transition-all duration-300"
          :class="[
            isSidebarOpen ? 'left-[280px]' : 'left-[60px]',
            'md:left-[calc(50%-12px)]'
          ]"
        >
          <button
            @click="toggleSidebar"
            class="bg-slate-800 text-white p-2 rounded-full shadow-lg"
          >
            <span v-if="!isSidebarOpen">☰</span>
            <span v-else>✕</span>
          </button>
        </div>

        <main class="p-4 transition-all duration-300 ease-in-out">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
