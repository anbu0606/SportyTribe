<template>
  <main class="container py-5" role="main" aria-label="Resources Page">
    <p class="text-muted mb-4">
      Explore useful guides and information for your active lifestyle. Click on any card to learn more.
    </p>

    <!-- Resource cards loop -->
    <div
      v-for="resource in resourcesList"
      :key="resource.id"
      class="card mb-4 shadow-sm p-3 resource-card"
      role="link"
      tabindex="0" 
      @click="goToResource(resource.id)"
      @keypress.enter="goToResource(resource.id)"
      @keypress.space.prevent="goToResource(resource.id)"
      :aria-label="`Read more about ${resource.title}`"
    >
      <h3 class="resource-title">{{ resource.title }}</h3>
      <p class="resource-summary">{{ resource.summary }}</p>
      <router-link
        :to="`/resources/${resource.id}`"
        class="btn btn-primary mt-2"
        @click.stop
        :aria-label="`Read more about ${resource.title}`"
      >
        Read More
      </router-link>
    </div>

  
  </main>
</template>

<script setup>
// Resources Page Logic
import { ref } from "vue"
import { useRouter } from "vue-router"
import resources from "../assets/json/resources.json"

const resourcesList = ref(resources)
const router = useRouter()

const goToResource = (id) => {
  router.push(`/resources/${id}`)
}
</script>

<style scoped>
.resource-card {
  border-radius: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  outline: none;
}

.resource-card:focus {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 2px solid #5085be;
}

.resource-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.resource-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.resource-summary {
  font-size: 1rem;
  color: #555;
}

.btn {
  background: #dd9a1e;
  border: none;
  transition: background 0.2s ease;
}
.btn:hover,
.btn:focus {
  background: #3697ff;
  outline: none;
}

.sportybot-section {
  margin-top: 2rem;
  border-top: 1px solid #ddd;
  padding-top: 2rem;
}
</style>
