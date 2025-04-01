<!-- src/components/NewReservationModal.vue -->
<script setup>
import { ref, computed } from 'vue'
// Ändern Sie die Imports zu:
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/solid' // Statt 'outline'

const props = defineProps({
  boats: Array,
  currentUser: Object,
  show: Boolean
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  title: '',
  from: '',
  to: '',
  boatId: '',
  checklist: [
    { text: 'I agree to the boat usage rules', checked: false },
    { text: 'I confirm I have the required license', checked: false },
    { text: 'I will report any damages immediately', checked: false }
  ],
  notes: ''
})

const totalPrice = computed(() => {
  if (!form.value.boatId || !form.value.from || !form.value.to) return 0
  
  const boat = props.boats.find(b => b.id === form.value.boatId)
  if (!boat || !boat.fields.Price) return 0
  
  const hours = (new Date(form.value.to) - new Date(form.value.from)) / (1000 * 60 * 60)
  return (hours * boat.fields.Price).toFixed(2)
})

const canSubmit = computed(() => {
  return form.value.title &&
        form.value.from &&
        form.value.to &&
        form.value.boatId &&
        form.value.checklist.every(item => item.checked)
})

function handleSubmit() {
    const fromDate = new Date(form.value.from)
    const toDate = new Date(form.value.to)
    const reservationData = {
        fields: {
            // Title: form.value.title,
            From: fromDate.toISOString(),
            To: toDate.toISOString(),
            FK_Boat: [form.value.boatId],
            FK_Member: [props.currentUser.id],
            // Notes: form.value.notes,
            TotalPrice: parseFloat(totalPrice.value),
            State: 'Pending'
        }
    }
    emit('submit', reservationData)
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>New Reservation</h2>
        <button @click="$emit('close')" class="close-btn">
          <XMarkIcon class="icon" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>Title</label>
          <input v-model="form.title" placeholder="Reservation title">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>From</label>
            <input type="datetime-local" v-model="form.from">
          </div>
          <div class="form-group">
            <label>To</label>
            <input type="datetime-local" v-model="form.to">
          </div>
        </div>
        
        <div class="form-group">
          <label>Boat</label>
          <select v-model="form.boatId">
            <option value="">Select a boat</option>
            <option 
              v-for="boat in boats" 
              :key="boat.id" 
              :value="boat.id"
              :disabled="!boat.fields.Availability"
            >
              {{ boat.fields.Name }} ({{ boat.fields.Numberplate }})
              <span v-if="!boat.fields.Availability"> - Not Available</span>
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Total Price</label>
          <div class="price-display">CHF {{ totalPrice }}</div>
        </div>
        
        <div class="checklist">
          <h4>Requirements</h4>
          <div 
            v-for="(item, index) in form.checklist" 
            :key="index" 
            class="checklist-item"
            @click="item.checked = !item.checked"
          >
            <div class="checkbox" :class="{ checked: item.checked }">
              <CheckIcon v-if="item.checked" class="check-icon" />
            </div>
            <span>{{ item.text }}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="form.notes" placeholder="Additional information"></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn secondary">Cancel</button>
        <button @click="handleSubmit" :disabled="!canSubmit" class="btn primary">
          Submit Reservation
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
  z-index: 1000; /* High z-index to appear above everything */
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

input, select, textarea {
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
  background: #4CAF50;
  border-color: #4CAF50;
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
</style>