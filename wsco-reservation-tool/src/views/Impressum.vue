<script setup>
import { ref, onMounted } from 'vue'
import BackToDashboardButton from '../components/Backbtn.vue'

const company = ref(null)

onMounted(async () => {
  const response = await fetch('/src/data/info.json')
  company.value = await response.json()
})
</script>

<template>
    <div class="max-w-3xl mx-auto px-6 py-10 text-slate-800">
        <BackToDashboardButton />

        <h1 class="text-2xl font-bold mt-8 mb-6">Impressum</h1>

        <div v-if="company" class="space-y-4 text-sm md:text-base">
            <p><strong>Firma:</strong> {{ company.companyName }}</p>
            <p><strong>Adresse:</strong> {{ company.address }}, {{ company.postalCode }} {{ company.country }}</p>
            <p><strong>E-Mail:</strong> <a :href="`mailto:${company.email}`" class="text-blue-600 hover:underline">{{ company.email }}</a></p>
            <p><strong>Telefon:</strong> <a :href="`tel:${company.phone}`" class="text-blue-600 hover:underline">{{ company.phone }}</a></p>
            <p><strong>Verantwortlich:</strong> {{ company.responsible }}</p>
            <p><strong>Handelsregister:</strong> {{ company.commercialRegister }}</p>
            <p><strong>Mehrwertsteuernummer:</strong> {{ company.vatNumber }}</p>
            <p><strong>Haftungsausschluss:</strong> {{ company.disclaimer }}</p>
        </div>

        <div v-else class="text-slate-500">Lade Impressum...</div>
    </div>
</template>
