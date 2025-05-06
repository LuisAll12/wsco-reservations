<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

// Testdaten – später aus einer API oder zentralen Datei holen
const boats = ref([
  {
    id: 1,
    name: 'Sea Explorer',
    plate: 'ZH 12345',
    image: 'https://i.pinimg.com/736x/c0/d4/bb/c0d4bb1c8db652872de1d5ffb94b6475.jpg',
    description: 'Ideal für Küstentouren mit Familie.',
    capacity: 6,
    pricePerHour: 75,
    pdfUrl: 'https://example.com/manuals/sea-explorer.pdf'
  },
  {
    id: 2,
    name: 'Ocean Breeze',
    plate: 'LU 54321',
    image: 'https://i.pinimg.com/736x/c0/d4/bb/c0d4bb1c8db652872de1d5ffb94b6475.jpg',
    description: 'Komfortables Motorboot für Ausflüge.',
    capacity: 4,
    pricePerHour: 65,
    pdfUrl: 'https://example.com/manuals/ocean-breeze.pdf'
  },
  {
    id: 3,
    name: 'River Runner',
    plate: 'BE 11122',
    image: 'https://i.pinimg.com/736x/14/25/47/142547271c036b14137604901d35e2c7.jpg',
    description: 'Wendig und perfekt für Flüsse.',
    capacity: 2,
    pricePerHour: 50,
    pdfUrl: 'https://poropointfreeport.gov.ph/wp-content/uploads/2023/02/PPFZ-Local-Purchase-Form.pdf'
  },
  {
    id: 4,
    name: 'Sea Explorer',
    plate: 'AG 99887',
    image: 'https://i.pinimg.com/736x/14/25/47/142547271c036b14137604901d35e2c7.jpg',
    description: 'Zweites Modell, größerer Tank.',
    capacity: 8,
    pricePerHour: 90,
    pdfUrl: 'https://example.com/manuals/sea-explorer-v2.pdf'
  }
])


const route = useRoute()
const boat = ref(null)
const showImageModal = ref(false)

function openImageModal() {
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
}

onMounted(() => {
  const id = parseInt(route.params.id)
  boat.value = boats.value.find(b => b.id === id)
})
</script>

<template>
  <div class="boat-detail-container" v-if="boat">
    <router-link to="/dashboard/unsere-boote" class="back-link">← Zurück zur Übersicht</router-link>

    <h1>{{ boat.name }}</h1>
    <img :src="boat.image"
        alt="Bootsbild"
        class="large-image"
        @click="openImageModal"/>

    <div class="details">
      <p><strong>Nummernschild:</strong> {{ boat.plate }}</p>
      <p><strong>Kapazität:</strong> {{ boat.capacity }} Personen</p>
      <p><strong>Preis:</strong> CHF {{ boat.pricePerHour }} / Stunde</p>
      <p class="desc">{{ boat.description }}</p>
    </div>

    <div class="pdf-section">
      <h2>Bedienungsanleitung</h2>
      <iframe
        :src="boat.pdfUrl"
        width="100%"
        height="600"
        style="border: none"
        title="PDF Anleitung"
      ></iframe>
    </div>
  </div>
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
        <img :src="boat.image" alt="Originalbild" class="modal-image" />
    </div>
</template>

<style scoped>
.boat-detail-container {
  max-width: 900px;
  margin: auto;
  padding: 32px;
  font-family: 'Segoe UI', sans-serif;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #3498db;
  text-decoration: none;
}

.large-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 24px;
}

.details p {
  font-size: 16px;
  margin: 8px 0;
}

.desc {
  margin-top: 12px;
  color: #555;
}

.pdf-section {
  margin-top: 40px;
}

.pdf-section h2 {
  font-size: 20px;
  margin-bottom: 16px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

</style>
