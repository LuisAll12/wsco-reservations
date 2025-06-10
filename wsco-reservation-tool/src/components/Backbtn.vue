<script setup>
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBackToDashboard() {
    router.push('/dashboard')
}
</script>

<template>
    <button
        @click="goBackToDashboard"
        class="inline-flex items-center px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shadow-sm transition duration-200 ease-in-out group">
        <ArrowLeftIcon class="w-5 h-5 mr-2 text-slate-500 group-hover:-translate-x-1 transition-transform duration-200" />
        Zurück zum Dashboard
    </button>
</template>
