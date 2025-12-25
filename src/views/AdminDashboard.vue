<template>
  <main class="container py-5" role="main">
    <!-- customize chart view -->
    <div class="filters d-flex flex-wrap gap-3 align-items-end mb-4">
      <!-- Chart type selection -->
      <div>
        <label for="chartType" class="form-label"><strong>Chart Type</strong></label>
        <select id="chartType" v-model="selectedChart" class="form-select">
          <option value="location">By Location</option>
          <option value="status">By Status</option>
        </select>
      </div>

      <div>
        <label for="timePeriod" class="form-label"><strong>Time Period</strong></label>
        <select id="timePeriod" v-model="selectedPeriod" class="form-select">
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label class="form-label"><strong>From</strong></label>
        <input type="date" v-model="dateFrom" class="form-control" />
      </div>
      <div>
        <label class="form-label"><strong>To</strong></label>
        <input type="date" v-model="dateTo" class="form-control" />
      </div>

      <div>
        <label for="statusFilter" class="form-label"><strong>Status</strong></label>
        <select id="statusFilter" v-model="selectedStatus" class="form-select">
          <option value="">All</option>
          <option value="Registered">Registered</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Confirmed">Confirmed</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info" role="status">
      Loading data from Firestore...
    </div>

    <div v-else class="chart-container">
      <Bar
        v-if="selectedChart === 'location'"
        :data="locationChartData"
        :options="barChartOptions"
        :height="250"
      />
      <Pie
        v-else
        :data="statusChartData"
        :options="pieChartOptions"
        :height="250"
      />
    </div>
  </main>
</template>

<script setup>
// Event Charts Page
import { ref, computed, onMounted } from "vue"
import { Bar, Pie } from "vue-chartjs"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/init"

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

const selectedChart = ref("location")
const selectedStatus = ref("")
const selectedPeriod = ref("monthly")
const dateFrom = ref("")
const dateTo = ref("")
const eventsData = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const snapshot = await getDocs(collection(db, "adminUserEvents"))
    eventsData.value = snapshot.docs.map(doc => ({
      ...doc.data(),
      date: new Date(doc.data().date),
    }))
  } catch (err) {
    console.error("Error fetching Firestore data:", err)
  } finally {
    loading.value = false
  }
})

const filteredEvents = computed(() =>
  eventsData.value.filter(e => {
    const matchStatus = selectedStatus.value ? e.Status === selectedStatus.value : true
    const matchFrom = dateFrom.value ? e.date >= new Date(dateFrom.value) : true
    const matchTo = dateTo.value ? e.date <= new Date(dateTo.value) : true
    return matchStatus && matchFrom && matchTo
  })
)
// Group events by period (monthly/yearly)
const groupByPeriod = (events) => {
  const groups = {}
  events.forEach(e => {
    const key =
      selectedPeriod.value === "yearly"
        ? e.date.getFullYear()
        : `${e.date.getFullYear()}-${(e.date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`
    groups[key] = (groups[key] || 0) + 1
  })
  return groups
}

// Aggregate data for charts
const locationCounts = computed(() => {
  const data = {}
  filteredEvents.value.forEach(e => {
    const loc = e.Location || "Unknown"
    data[loc] = (data[loc] || 0) + 1
  })
  return data
})

const statusCounts = computed(() => {
  const data = {}
  filteredEvents.value.forEach(e => {
    const s = e.Status || "Unknown"
    data[s] = (data[s] || 0) + 1
  })
  return data
})

const locationChartData = computed(() => ({
  labels: Object.keys(locationCounts.value),
  datasets: [
    {
      label: `Registrations (${selectedPeriod.value})`,
      backgroundColor: "#42a5f5",
      data: Object.values(locationCounts.value),
    },
  ],
}))

const statusChartData = computed(() => ({
  labels: Object.keys(statusCounts.value),
  datasets: [
    {
      label: "Registrations by Status",
      backgroundColor: ["#28a745", "#ffc107", "#dc3545", "#17a2b8"],
      data: Object.values(statusCounts.value),
    },
  ],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Event Registrations by Location" },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
  },
}

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "Event Registrations by Status" },
  },
}
</script>

<style scoped>
.filters {
  background: #88c4ff;
  border-radius: 10px;
  padding: 1rem;
}
.chart-container {
  max-width: 700px;
  height: 350px;
  margin: 1.5rem auto;
  background: #ffffff;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
select,
input[type="date"] {
  min-width: 150px;
}
select:focus,
input:focus {
  outline: 3px solid #06d6ff;
  outline-offset: 2px;
}
</style>