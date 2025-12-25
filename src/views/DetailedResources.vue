<template>
  <main class="container py-5" role="main">
    <div v-if="resource"  class="resource-content-card p-4 mb-4">
        <h3 class="resource-title mb-3">{{ resource.title }}</h3>
      <p class="resource-text">{{ resource.content }}</p>

      <div class="mt-4">
        <button @click="exportPDF" class="btn btn-success me-2">Export as PDF</button>
        <button @click="exportCSV" class="btn btn-secondary">Export as CSV</button>
      </div>
    </div>
    <div v-else>
      <p>Resource not found.</p>
    </div>
  </main>
</template>

<script setup>
// Resource Detail Page Logic
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
//Resource data
import resources from "../assets/json/resources.json"

// jsPDF for PDF export
import jsPDF from "jspdf"
import "jspdf-autotable"

const route = useRoute()
const resource = ref(null)

onMounted(() => {
  const id = parseInt(route.params.id)
  resource.value = resources.find((r) => r.id === id)
})

// Export resource content as PDF
const exportPDF = () => {
  if (!resource.value) return
  const doc = new jsPDF()
  doc.text(resource.value.title, 10, 10)
  doc.text(resource.value.content, 10, 20)
  doc.save(`${resource.value.title}.pdf`)
}

// Export resource content as CSV
const exportCSV = () => {
  if (!resource.value) return
  const csvContent = `"Title","Content"\n"${resource.value.title}","${resource.value.content.replace(/"/g, '""')}"`
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${resource.value.title}.csv`
  link.click()
}
</script>

<style scoped>
.btn {
  padding: 0.3em 2em;
  border-radius: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.btn:hover,
.btn:focus {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  outline: none;
}

.resource-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #222;
}

.resource-text {
  margin-bottom: 1.5rem;
}

.resource-content-card {
  background-color: #88ebff; 
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  line-height: 1.6;
  font-size: 1.05rem;
  color: #333;
}
</style>