<script setup>
import { ref, onMounted } from "vue"
import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/init"

const userEvents = ref([])
const filters = ref({ global: { value: null } })
const loading = ref(true)

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "adminUserEvents"))
    userEvents.value = querySnapshot.docs.map((doc) => doc.data())
  } catch (err) {
    console.error("Error loading events:", err)
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString) => format(new Date(dateString), "dd/MM/yyyy")

const getStatusClass = (status) => {
  switch (status) {
    case "Registered": return "bg-success text-white"
    case "Pending": return "bg-warning text-dark"
    case "Cancelled": return "bg-danger text-white"
    case "Confirmed": return "bg-info text-white"
    default: return "bg-secondary text-white"
  }
}

const exportCSV = () => {
  if (!userEvents.value.length) return
  const headers = Object.keys(userEvents.value[0]).join(",")
  const rows = userEvents.value.map((item) => Object.values(item).join(","))
  const csv = [headers, ...rows].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "RegisteredUsers.csv"
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export user event data as a PDF file using jsPDF and autoTable
 */
const exportPDF = () => {
  if (!userEvents.value.length) return
  const doc = new jsPDF()
  doc.text("Registered Users & Their Events", 14, 15)
  autoTable(doc, {
    head: [Object.keys(userEvents.value[0])],
    body: userEvents.value.map((p) => Object.values(p)),
    startY: 25,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 100, 0] },
  })
  doc.save("RegisteredUsers.pdf")
}
</script>

<template>
  <main class="container py-5" role="main">
    <div class="d-flex justify-content-end mb-3 gap-2 flex-wrap">
      <button class="btn btn-success" @click="exportCSV" aria-label="Export table data as CSV file" >
        Export as CSV
      </button>
      <button
        class="btn btn-danger"
        @click="exportPDF"
        aria-label="Export table data as PDF file"
      > Export as PDF
      </button>
    </div>

    <div class="mb-3">
      <label for="searchInput" class="visually-hidden">Search users or events</label>
      <InputText
        id="searchInput"
        v-model="filters.global.value"
        placeholder="Search users or events..."
        aria-labelledby="searchInput pageTitle"
        class="search-input"
      />
    </div>

    <!-- Data Table -->
    <DataTable
      v-if="!loading"
      :value="userEvents"
      :filters="filters"
      paginator
      :rows="4"
      :rowsPerPageOptions="[10, 20, 50]"
      sortMode="multiple"
      filterDisplay="menu"
      responsiveLayout="scroll"
      stripedRows
      tableStyle="min-width: 60rem"
      aria-labelledby="pageTitle pageDesc"
      aria-label="Registered user event table"
    >
      <Column field="name" header="User Name" sortable filter filterPlaceholder="Search by name" style="width: 7%" />
      <Column field="email" header="Email" sortable filter filterPlaceholder="Search by email" style="width: 6%" />
      <Column field="Event" header="Registered Event" sortable filter filterPlaceholder="Search by event" style="width: 5%" />
      <Column field="date" header="Event Date" sortable style="width: 5%">
        <template #body="{ data }">{{ formatDate(data.date) }}</template>
      </Column>
      <Column field="Location" header="Location" sortable filter filterPlaceholder="Search by location" style="width: 5%" />
      <Column field="Status" header="Status" sortable filter filterPlaceholder="Search by status" style="width: 5%">
        <template #body="{ data }">
          <span :class="['badge', getStatusClass(data.Status)]">{{ data.Status }}</span>
        </template>
      </Column>
    </DataTable>

    <div v-else class="text-center py-5">
      <div class="spinner-border text-primary" role="status" aria-label="Loading data"></div>
      <p class="mt-3 text-muted">Loading events...</p>
    </div>
  </main>
</template>

<style scoped>
.search-input {
  width: 100%;
  max-width: 300px;
  display: inline-block;
}
.badge {
  padding: 0.4em 0.7em;
  border-radius: 0.5em;
  font-size: 0.85em;
}
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  border: 0 !important;
}
input:focus,
button:focus,
a:focus,
.p-paginator button:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
.btn {
  border-radius: 6px;
}
</style>