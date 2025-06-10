<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const company = ref(null);

onMounted(async () => {
  const response = await fetch("/src/data/infoImpressum.json");
  company.value = await response.json();
});

function goBack() {
  router.push("/dashboard");
}
</script>

<template>
    <div class="relative min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 text-slate-800">
        <div v-if="company">
            <h1 class="text-3xl font-bold mb-8 text-center">Impressum</h1>
            <!-- Inhalt -->
            <div
            v-if="company" class="space-y-6 text-sm md:text-base leading-relaxed">
            <p><strong>Firma:</strong> {{ company.companyName }}</p>
            <p>
                <strong>Adresse:</strong> {{ company.address }},
                {{ company.postalCode }} {{ company.country }}
            </p>
            <p>
                <strong>E-Mail:</strong>
                <a
                :href="`mailto:${company.email}`"
                class="text-blue-600 hover:underline"
                >{{ company.email }}</a
                >
            </p>
            <p>
                <strong>Telefon:</strong>
                <a :href="`tel:${company.phone}`" class="text-blue-600 hover:underline">
                    {{ company.phone }}
                </a>
            </p>
            <p><strong>Verantwortlich:</strong> {{ company.responsible }}</p>
            <p>
                <strong>Handelsregister:</strong> {{ company.commercialRegister }}
            </p>
            <p><strong>Mehrwertsteuernummer:</strong> {{ company.vatNumber }}</p>
            <p><strong>Haftungsausschluss:</strong> {{ company.disclaimer }}</p>
            </div>

            <div class="mt-10 text-center">
            <button
                @click="goBack"
                class="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition"
            >
                ⬅ Zurück zum Dashboard
            </button>
            </div>
        </div>
        <!-- Titel -->

        <div v-else class="text-slate-500">Lade Impressum...</div>
        </div>
    </div>
</template>
