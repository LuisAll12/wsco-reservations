<template>
  <div class="widget-card">
    <div class="header">
      <h2>Boot erstellen</h2>
      <button @click="openDialog = true" class="btn primary">Neues Boot</button>
    </div>

    <div v-if="openDialog" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Neues Boot erstellen</h2>
          <button @click="openDialog = false" class="close-btn">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group" v-for="field in fields" :key="field.label">
            <label :for="field.model">{{ field.label }}</label>
            <component
              :is="field.type"
              v-model="boat[field.model]"
              v-bind="field.attrs"
              :placeholder="field.placeholder"
            ></component>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="openDialog = false" class="btn secondary">Abbrechen</button>
          <button @click="submitBoat" class="btn primary">Erstellen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';

const openDialog = ref(false);

const boat = ref({
  name: '',
  description: '',
  numberplate: '',
  pricePerHour: '',
  Type: '',
  status: 'available',
});

const fields = [
  { label: 'Name', model: 'name', type: 'input', placeholder: 'Bootsname', attrs: {} },
  { label: 'Beschreibung', model: 'description', type: 'textarea', placeholder: 'Beschreibung', attrs: {} },
  { label: 'Nummernschild', model: 'numberplate', type: 'input', placeholder: 'z. B. 123', attrs: { type: 'number' } },
  { label: 'Preis pro Stunde', model: 'pricePerHour', type: 'input', placeholder: 'z. B. 45', attrs: { type: 'number', step: 0.1 } },
  { label: 'Typ', model: 'Type', type: 'input', placeholder: 'z. B. Ruderboot', attrs: {} },
  { label: 'Status', model: 'status', type: 'select', placeholder: '', attrs: {} },
];

const submitBoat = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: boat.value.name,
        description: boat.value.description,
        numberplate: parseInt(boat.value.numberplate),
        pricePerBlock: parseFloat(boat.value.pricePerHour),
        Type: boat.value.Type,
        status: boat.value.status,
      }),
    });
    if (!res.ok) throw new Error('Fehler beim Erstellen');
    alert('Boot erfolgreich erstellt!');
    openDialog.value = false;
  } catch (err) {
    console.error('Fehler:', err);
    alert('Fehler beim Erstellen des Bootes');
  }
};
</script>

<style scoped>
.widget-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn.primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn.secondary {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1rem;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group {
  margin-bottom: 16px;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>


<style scoped>
.preview img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    margin-top: 1rem;
}

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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
</style>


