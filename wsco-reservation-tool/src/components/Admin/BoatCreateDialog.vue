<template>
  <div class="widget">
    <h2>Boot erstellen</h2>
    <button @click="openDialog = true">Neues Boot</button>

    <div v-if="openDialog" class="dialog">
      <div class="dialog-content">
        <h3>Bootsdaten</h3>
        <input v-model="boat.name" placeholder="Name" />
        <input v-model="boat.description" placeholder="Beschreibung" />
        <input v-model="boat.numberplate" type="number" placeholder="Nummernschild" />
        <input v-model="boat.pricePerBlock" type="number" placeholder="Preis pro Block" />
        <select v-model="boat.status">
          <option value="available">Verfügbar</option>
          <option value="unavailable">Nicht verfügbar</option>
        </select>
        <input v-model="boat.Type" placeholder="Typ" />
        <button @click="submitBoat">Erstellen</button>
        <button @click="openDialog = false">Abbrechen</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const openDialog = ref(false);
const boat = ref({
  name: '',
  description: '',
  numberplate: '',
  pricePerBlock: '',
  Type: '',
  status: 'available',
});

const submitBoat = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boat.value),
    });
    if (!res.ok) throw new Error('Fehler beim Erstellen');
    openDialog.value = false;
    alert('Boot erstellt!');
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped>
.widget {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.dialog {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
}
.dialog-content {
  background: white;
  margin: 10% auto;
  padding: 1rem;
  width: 300px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
