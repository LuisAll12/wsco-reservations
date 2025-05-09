<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { debounce } from 'lodash'
import { XMarkIcon, CheckIcon } from "@heroicons/vue/24/solid";
import checkBoatAvailability from '../services/CheckBoatAvailability';

// 1. First declare all reactive variables
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
  ],
  notes: "",
});

// 2. Then declare props and emits
const props = defineProps({
  boats: Array,
  currentUser: Object,
  show: Boolean,
});
const emit = defineEmits(["close", "submit"]);

// 3. Then computed properties
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

// console.log(form.value.boatId);

// 4. Then utility functions
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

// 6. Finally component methods
function handleSubmit() {
  const fromDate = new Date(form.value.from);
  const toDate = new Date(form.value.to);
  const reservationData = {
    FK_BoatId: form.value.boatId,
    startDate: form.value.from,
    endDate: form.value.to,
    price: parseFloat(totalPrice.value),
  };

  emit("submit", reservationData);
}
onBeforeUnmount(() => {
  debouncedCheckAvailability.cancel();
  console.log("User", props.currentUser);
});
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>Neue Reservation</h2>
        <button @click="$emit('close')" class="close-btn">
          <XMarkIcon class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <!-- <div class="form-group">
          <label>Title</label>
          <input v-model="form.title" placeholder="Reservation title" />
        </div> -->

        <div class="form-row">
          <div class="form-group">
            <label>Von</label>
            <input type="datetime-local" v-model="form.from" :min="new Date().toISOString().slice(0, 16)"
              @change="checkAvailability">
          </div>
          <div class="form-group">
            <label>Bis</label>
            <input type="datetime-local" v-model="form.to" :min="form.from || new Date().toISOString().slice(0, 16)"
              @change="checkAvailability">
          </div>
        </div>
        <div v-if="isCheckingAvailability" class="loading-message">
          <span class="loader"></span> Überprüfe Verfügbarkeit...
        </div>

        <div v-if="availabilityError" class="error-message">
          {{ availabilityError }}
        </div>

        <div v-else-if="form.boatId && form.from && form.to" class="success-message">
          <CheckIcon class="icon" /> Boot ist verfügbar
        </div>
        <div class="form-group">
          <label>Boot</label>
          <select v-model="form.boatId" @change="availabilityError = ''">
            <option value="">Wähle ein Boot</option>
            <option v-for="boat in boats" :key="boat.id" :value="boat.id" :disabled="boat.status === 'unavailable'">
              {{ boat.name }} ({{ boat.numberplate }})
              <span v-if="boat.status === 'unavailable'"> - Nicht verfügbar</span>
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Totaler Preis</label>
          <div class="price-display">CHF {{ totalPrice }}</div>
        </div>

        <div class="checklist">
          <h4>Voraussetzungen</h4>
          <div v-for="(item, index) in form.checklist" :key="index" class="checklist-item"
            @click="item.checked = !item.checked">
            <div class="checkbox" :class="{ checked: item.checked }">
              <CheckIcon v-if="item.checked" class="check-icon" />
            </div>
            <span>{{ item.text }}</span>
          </div>
        </div>
        <div class="payment-info">
          <h4>Hier zur Bezahlung</h4>
          <button class="stripe-payment">
            💳 Jetzt mit Stripe bezahlen
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn secondary">Abbrechen</button>
        <button @click="handleSubmit" :disabled="isSubmitting" class="btn primary">
          <span v-if="isSubmitting">Buchen...</span>
          <span v-else>Reservierung abschicken</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex !important;
  opacity: 1 !important;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* High z-index to appear above everything */
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.icon {
  width: 24px;
  height: 24px;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.price-display {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.checklist {
  margin: 24px 0;
}

.checklist-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #4caf50;
  border-color: #4caf50;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn.primary {
  background: #3498db;
  color: white;
  border: none;
}

.btn.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn.secondary {
  background: white;
  border: 1px solid #ddd;
}

.error-message {
  color: #ff4444;
  margin: 10px 0;
  padding: 10px;
  background: #ffeeee;
  border-radius: 4px;
}

.loading-message {
  color: #666;
  margin: 10px 0;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.success-message {
  color: #4CAF50;
  margin: 10px 0;
  padding: 10px;
  background: #f0fff0;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.success-message .icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.error-message {
  color: #ff4444;
  margin: 10px 0;
  padding: 10px;
  background: #ffeeee;
  border-radius: 4px;
}

.stripe-payment {
  background: linear-gradient(135deg, #6772e5, #5a67d8);
  color: #fff;
  border: none;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.stripe-payment:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #6b73ff, #667eea);
}
</style>
