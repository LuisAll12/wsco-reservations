<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
const route = useRoute();

const boat = ref(null)
const showImageModal = ref(false)

function openImageModal() {
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
}

onMounted(async() => {

  const id = route.params.id
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat/${id}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    boat.value = await response.json()
    console.log('Response:', boat.value)
  } catch (error) {
    console.error(error)
    alert('Boot nicht gefunden')
  }
})
</script>

<template>
  <div class="boat-detail-container" v-if="boat">

    <h1>{{ boat.name }}</h1>
    <img :src="boat.imgUrl"
        alt="Bootsbild"
        class="large-image"
        @click="openImageModal"/>
    
    <div class="details">
      <p><strong>Nummernschild:</strong> {{ boat.numberplate }}</p>
      <p><strong>Preis:</strong> CHF {{ boat.pricePerBlock }} / Stunde</p>
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
        <img :src="boat.imgUrl" alt="Originalbild" class="modal-image" />
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
