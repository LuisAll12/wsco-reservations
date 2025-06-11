<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { debounce } from 'lodash';
import { XMarkIcon, CheckIcon } from "@heroicons/vue/24/solid";
import checkBoatAvailability from '../services/CheckBoatAvailability';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

const availabilityError = ref("");
const isCheckingAvailability = ref(false);
const isSubmitting = ref(false);

const form = ref({
  title: "",
  from: "",
  to: "",
  boatId: "",
  checklist: [
    { text: "Ich erkläre mich mit den Regeln der Bootsnutzung einverstanden", checked: false },
    { text: "Ich bestätige, dass ich die erforderliche Lizenz besitze", checked: false },
    { text: "Ich werde jeden Schaden sofort melden", checked: false },
    { text: "Ich akzeptiere die AGBs", checked: false },
  ],
  notes: "",
});

const props = defineProps({ boats: Array, currentUser: Object, show: Boolean });
const emit = defineEmits(["close", "submit"]);

const canSubmit = computed(() => {
  const allChecked = form.value.checklist.every(i => i.checked);
  const validDates = form.value.from && form.value.to && new Date(form.value.to) > new Date(form.value.from);
  const boatOK = !!form.value.boatId;
  return allChecked && validDates && boatOK && availabilityError.value === '';
});


watch(
  [() => form.value.boatId, () => form.value.from, () => form.value.to],
  (newValues) => {
    debouncedCheckAvailability(newValues);
  },
  { deep: true }
);

const sessionKey = document.cookie.split('; ').find(r => r.startsWith('session_key='))?.split('=')[1];

function handleSubmit() {
  isSubmitting.value = true;
  const reservationData = {
    FK_BoatId: form.value.boatId,
    startDate: form.value.from,
    endDate: form.value.to,
    price: parseFloat(totalPrice.value),
  };
  emit("submit", reservationData);
}

onBeforeUnmount(() => debouncedCheckAvailability.cancel());


const debouncedCheckAvailability = debounce(async ([boatId, from, to]) => {
  if (!boatId || !from || !to) {
    availabilityError.value = '';
    return;
  }
  const selectedBoat = computed(() => {
    return props.boats.find((b) => b.id === form.value.boatId);
  });

  const BoatNr = selectedBoat.value?.id;

  if (new Date(from) >= new Date(to)) {
    availabilityError.value = 'Endzeit muss nach Startzeit liegen';
    return;
  }

  const boat = props.boats.find(b => b.id === boatId);
  if (boat.status !== 'available') {
    availabilityError.value = 'Dieses Boot ist nicht verfügbar';
    return;
  }

  isCheckingAvailability.value = true;
  try {
    const { available, conflictingReservations, error } =
      await checkBoatAvailability(BoatNr, from, to);

    if (error) {
      availabilityError.value = `Boot bereits von ${conflictTime} Uhr gebucht`;
    } else if (!available) {
      const conflictTime = format(new Date(conflictingReservations[0].fields.From), 'HH:mm');
      availabilityError.value = `Boot bereits von ${conflictTime} Uhr gebucht`;
    } else {
      availabilityError.value = '';
    }
  } catch (error) {
    availabilityError.value = 'Boot bereits zu dieser Uhrzeit gebucht';
  } finally {
    isCheckingAvailability.value = false;
  }
}, 500);

// 5. Then watchers (now form is defined)
watch(
  [() => form.value.boatId, () => form.value.from, () => form.value.to],
  (newValues) => {
    debouncedCheckAvailability(newValues);
  },
  { deep: true }
);



const totalPrice = computed(() => {
  if (!form.value.boatId || !form.value.from || !form.value.to) return 0;

  const from = new Date(form.value.from);
  const to = new Date(form.value.to);

  if (to <= from) return 0;

  const boat = props.boats.find((b) => b.id === form.value.boatId);
  if (!boat || !boat.pricePerBlock) return 0;

  const hours = (to - from) / (1000 * 60 * 60);
  return (hours * boat.pricePerBlock).toFixed(2);
});


</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden transform transition-transform scale-100">

      <header class="flex justify-between items-center px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">Neue Reservation</h2>
        <button @click="$emit('close')" aria-label="Schliessen" class="p-2 rounded hover:bg-gray-100">
          <XMarkIcon class="h-5 w-5 text-gray-600" />
        </button>
      </header>

      <div class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Von</label>
            <input type="datetime-local" v-model="form.from" :min="new Date().toISOString().slice(0, 16)"
              class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Bis</label>
            <input type="datetime-local" v-model="form.to" :min="form.from || new Date().toISOString().slice(0, 16)"
              class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500" />
          </div>
        </div>

        <div v-if="isCheckingAvailability" class="flex items-center text-gray-600">
          <svg class="animate-spin h-5 w-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Verfügbarkeit prüfen...
        </div>

        <p v-if="availabilityError" class="text-red-600 bg-red-50 p-2 rounded-md">{{ availabilityError }}</p>
        <p v-else-if="form.boatId && form.from && form.to"
          class="flex items-center text-green-600 bg-green-50 p-2 rounded-md">
          <CheckIcon class="h-5 w-5 mr-2" /> Boot ist verfügbar
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Boot</label>
          <Listbox v-model="form.boatId">
            <div class="relative">
              <ListboxButton
                class="relative w-full cursor-default rounded-md bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <span class="block truncate">
                  {{props.boats.find(b => b.id === form.boatId)?.name || 'Boot auswählen'}}
                </span>
              </ListboxButton>
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/10 focus:outline-none sm:text-sm">
                <ListboxOption v-for="boat in props.boats" :key="boat.id" :value="boat.id"
                  :disabled="boat.status !== 'available'" v-slot="{ active, selected, disabled }">
                  <li :class="[
                    'relative cursor-default select-none rounded-md py-2 pl-10 pr-4',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  ]">
                    <span :class="['block truncate', selected ? 'font-semibold' : 'font-normal']">
                      {{ boat.name }} ({{ boat.numberplate }}) <span v-if="boat.status !== 'available'">– nicht
                        verfügbar</span>
                    </span>
                    <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>


        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-700">Totaler Preis</span>
          <span class="text-lg font-semibold text-gray-900">CHF {{ totalPrice }}</span>
        </div>

        <div class="space-y-3 pt-4">
          <h4 class="text-sm font-medium text-gray-800">Voraussetzungen</h4>
          <div v-for="(item, idx) in form.checklist" :key="idx" @click="item.checked = !item.checked"
            class="flex items-center space-x-2 cursor-pointer">
            <div :class="['flex-none w-5 h-5 border rounded-md flex items-center justify-center',
              item.checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300']">
              <CheckIcon v-if="item.checked" class="h-4 w-4 text-white" />
            </div>
            <span class="text-sm text-gray-700">{{ item.text }}</span>
          </div>
        </div>
      </div>

      <footer class="px-6 py-4 border-t flex justify-end gap-3">
        <button @click="$emit('close')"
          class="py-2 px-4 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Abbrechen
        </button>
        <button @click="handleSubmit" :disabled="isSubmitting || !canSubmit"
          class="relative inline-flex items-center justify-center py-2 px-6 font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg
                       hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span v-if="!isSubmitting">💳 Jetzt mit Stripe</span>
          <span v-else>Wird abgeschlossen…</span>
        </button>
      </footer>

    </div>
  </div>
</template>
