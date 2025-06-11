<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { getUserReservations, createDamageReport } from '../services/ReportDamageService.js'
import { getCurrentUserFromSession } from '../services/sessionKeyService.js'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

import { CheckIcon } from '@heroicons/vue/24/solid'

const reservations = ref([])
const type = ref('')
const reason = ref('')
const description = ref('')
const selectedReservationId = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const contactEmail = 'support@wsco.ch'

// Airtable-kompatible Typenliste
const typeOptions = ['Loch', 'Fehlendes Teil', 'Motor', 'Elektronik', 'Sonstiges']

const canSubmit = computed(() =>
  type.value &&
  reason.value.trim().length > 0 &&
  description.value.trim().length > 0 &&
  selectedReservationId.value
)

async function submitDamageReport() {
  if (!canSubmit.value) return
  isSubmitting.value = true

  try {
    const selected = reservations.value.find(r => r.id === selectedReservationId.value)
    const user = await getCurrentUserFromSession()

    const payload = {
      Type: type.value,
      Reason: reason.value.trim(),
      Description: description.value.trim(),
      Reservation: [selected.id],   // Referenz auf Reservation
      CreatedPerson: [user.id]      // Referenz auf User
    }

    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/damage-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(`Serverantwort: ${res.status}`)

    alert('Schadensmeldung erfolgreich gesendet.')

    // Reset
    type.value = ''
    reason.value = ''
    description.value = ''
    selectedReservationId.value = ''
  } catch (err) {
    console.error('Fehler beim Senden der Schadensmeldung:', err)
    alert('Fehler beim Senden der Schadensmeldung.')
  } finally {
    isSubmitting.value = false
  }
}


async function getBoatById(id) {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return await res.json();
}


onMounted(async () => {
  try {
    isLoading.value = true;

    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/user?status=active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const rawData = await res.json();
    const records = rawData.records || rawData;

    // Bootsdaten nachladen
    const enriched = await Promise.all(records.map(async (res) => {
      const boatId = res.FK_BoatId._path.segments[1];
      const boat = await getBoatById(boatId);
      return {
        ...res,
        boatName: boat.name,
        boatPlate: boat.numberplate
      };
    }));

    reservations.value = enriched;
  } catch (error) {
    console.error("Fehler beim Laden der Reservationen:", error);
    alert("Fehler beim Laden der Reservationen.");
  } finally {
    isLoading.value = false;
  }
});

const selectedReservationLabel = computed(() => {
  const res = reservations.value.find(r => r.id === selectedReservationId.value);
  if (!res) return '';
  return  `${res.boatName} (${res.boatPlate}) – ` +
          `${new Date(res.startDate).toLocaleDateString('de-CH')} ` +
          `${new Date(res.startDate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })} bis ` +
          `${new Date(res.endDate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Schaden melden</h2>

      <div v-if="isLoading" class="text-gray-600">Reservationen werden geladen…</div>

      <div v-else class="space-y-6">
        <!-- Reservation Auswahl -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reservation</label>
          <Listbox v-model="selectedReservationId">
            <div class="relative">
              <ListboxButton
                class="relative w-full cursor-default rounded-md bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <span class="block truncate">
                  {{ selectedReservationLabel || 'Reservation auswählen' }}
                </span>
              </ListboxButton>
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/10 focus:outline-none sm:text-sm">
                <template v-for="res in reservations" :key="res.id">
                  <ListboxOption :value="res.id" v-slot="slotProps">
                    <li
                      v-if="slotProps"
                      :class="[
                        'relative cursor-default select-none rounded-md py-2 pl-10 pr-4',
                        slotProps.active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                      ]"
                    >
                      <span :class="['block truncate', slotProps.selected ? 'font-semibold' : 'font-normal']">
                        {{ res.boatName }} ({{ res.boatPlate }}) –
                        {{ new Date(res.startDate).toLocaleDateString('de-CH') }}
                        {{ new Date(res.startDate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) }}
                        bis
                        {{ new Date(res.endDate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                      <span v-if="slotProps.selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </template>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <!-- Typ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Typ des Schadens</label>
          <select v-model="type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option disabled value="">Typ auswählen</option>
            <option v-for="opt in typeOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <!-- Grund -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kurzer Grund</label>
          <input
            type="text"
            v-model="reason"
            placeholder="z. B. Motor startet nicht"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <!-- Beschreibung -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
          <textarea
            v-model="description"
            placeholder="Beschreibe den Schaden ausführlich..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
          ></textarea>
        </div>

        <!-- Kontaktinfo -->
        <div class="text-sm text-gray-600">
          Für weitere Bilder sende bitte eine Mail an:
          <a :href="`mailto:${contactEmail}`" class="text-indigo-600 underline">{{ contactEmail }}</a>
        </div>

        <!-- Button -->
        <div>
          <button
            class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
            @click="submitDamageReport"
            :disabled="!canSubmit || isSubmitting"
          >
            {{ isSubmitting ? 'Wird gesendet…' : 'Schaden melden' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
