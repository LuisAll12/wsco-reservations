<script setup>
import {ref, onMounted} from 'vue';

const boats = ref([]);
const selectedBoat = ref(null);
const message = ref('');

//fetch boats from backend
onMounted(async () => {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`);
  boats.value = await res.json();
});

async function deleteBoat(){
    if (!selectedBoat.value) return;
    // get the boat id from the selectedBoat
    const boatId = boats.value.find(boat => boat.id === selectedBoat.value).id;
    console.log('Boat ID:', boatId);
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat/${boatId}`, {
            method: 'DELETE',
        });
        console.log('Response:', res);
    if (res.ok) {
        message.value = 'Boot erfolgreich gelöscht!';
        boats.value = boats.value.filter(boat => boat.id !== selectedBoat.value);
        selectedBoat.value = null;
    } else {
        message.value = 'Fehler beim Löschen des Bootes!';
    }
        
    } catch (error) {
        console.error('Fehler beim Löschen des Bootes:', error);
        message.value = 'Fehler beim Löschen des Bootes!';
    }
}
</script>

<template>
  <div class="widget">
    <h2 class="title">Boot löschen</h2>
    <p class="subtitle">Wähle ein Boot aus der Liste, das du entfernen möchtest.</p>

    <div class="form-group">
      <label for="boat-select">Boot auswählen</label>
      <select id="boat-select" v-model="selectedBoat" @change="onBoatSelect">
        <option disabled value="">-- Bitte Boot wählen --</option>
        <option v-for="boat in boats" :key="boat.id" :value="boat.id">
          {{ boat.name }}
        </option>
      </select>
    </div>

    <button class="btn danger" @click="deleteBoat" :disabled="!selectedBoat">
      🚨 Boot löschen
    </button>

    <p v-if="message" class="feedback-message">{{ message }}</p>
  </div>
</template>

<style scoped>


.title {
  font-size: 24px;
  margin-bottom: 0.5rem;
  color: #c0392b;
}

.subtitle {
  font-size: 16px;
  margin-bottom: 1.5rem;
  color: #666;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

select {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.btn.danger {
  background-color: #e74c3c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.btn.danger:hover {
  background-color: #c0392b;
}

.btn.danger:disabled {
  background-color: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}

.feedback-message {
  margin-top: 1rem;
  color: #2c3e50;
  font-weight: 500;
}
</style>
