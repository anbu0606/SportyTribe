<template>
  <main class="container py-4">
    <p class="text-muted">Explore upcoming events around you.</p>

    <!-- Radius filter control -->
    <div class="controls mb-3">
      <label for="radiusSelect" class="me-2"><strong>Show within:</strong></label>
      <select id="radiusSelect" v-model="radius" class="form-select d-inline-block w-auto">
        <option :value="25">25 km</option>
        <option :value="50">50 km</option>
        <option :value="100">100 km</option>
        <option :value="200">200 km</option>
        <option :value="0">All</option>
      </select>
    </div>

    <!-- Accessibility:number of events found -->
    <p aria-live="polite" class="visually-hidden">{{ accessibleMessage }}</p>

    <div id="map" class="map" role="application" aria-label="Map of nearby events"></div>
   
    <!-- Event List Section -->
    <section v-if="visibleEvents.length" class="event-list mt-4">
      <h3>Events within {{ radius }} km</h3>
      <ul class="list-group">
        <li
          v-for="ev in visibleEvents"
          :key="ev.id"
          class="list-group-item"
          @click="openModal(ev)"
          style="cursor: pointer;"
        >
          <strong>{{ ev.name }}</strong> - {{ ev.location }}
          <br />
          <small>{{ ev.date }}</small>
        </li>
      </ul>
    </section>

    <!-- Event Modal -->
    <div v-if="selectedEvent" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h4>{{ selectedEvent.name }}</h4>
        <p><strong>Date:</strong> {{ selectedEvent.date }}</p>
        <p><strong>Location:</strong> {{ selectedEvent.location }}</p>

        <div v-if="selectedEvent.ratings?.length">
          <p class="d-flex align-items-center gap-1">
  <strong>Ratings:</strong>
  {{ averageRating(selectedEvent.ratings) }}
  <Icon icon="mdi:star" class="text-warning" width="18" height="18" />
</p>
        </div>
        <div v-if="selectedEvent.reviews?.length">
          <p><strong>Reviews:</strong></p>
          <ul>
            <li v-for="(review, index) in selectedEvent.reviews" :key="index">{{ review }}</li>
          </ul>
        </div>

        <div v-else>
          <p>No reviews yet.</p>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-secondary" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// Events Map Page Logic
import { ref, onMounted, watch } from "vue";
// Leaflet for interactive map
import L from "leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/init";
import { Icon } from "@iconify/vue"

const map = ref(null);
const userLatLng = ref(null);
const eventMarkers = ref([]);
const radius = ref(50);
const visibleEvents = ref([]);
const selectedEvent = ref(null);
const accessibleMessage = ref("");

const eventsData = ref([]);

onMounted(async () => {
  await loadEvents();
  initMap();
});

async function loadEvents() {
  const snapshot = await getDocs(collection(db, "programdetails"));
  eventsData.value = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: data.id || doc.id,
        name: data.name || "Unnamed Event",
        date: data.date || "No date available",
        location: data.location || "No location available",
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        ratings: data.ratings || [],
        reviews: data.reviews || [],
      };
    })
    .filter((e) => !isNaN(e.lat) && !isNaN(e.lng));
}

// Initialize Leaflet map and user location
function initMap() {
  map.value = L.map("map").setView([-25.2744, 133.7751], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map.value);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLatLng.value = [pos.coords.latitude, pos.coords.longitude];
        L.marker(userLatLng.value, {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
            iconSize: [40, 40],
          }),
        })
          .addTo(map.value)
          .bindPopup('<div style="display:flex;align-items:center;gap:4px;"><span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007bff" viewBox="0 0 16 16"><path d="M8 0a5.53 5.53 0 0 0-5.5 5.5c0 3.037 5.5 10.5 5.5 10.5s5.5-7.463 5.5-10.5A5.53 5.53 0 0 0 8 0zm0 8A2.5 2.5 0 1 1 8 3a2.5 2.5 0 0 1 0 5z"/></svg></span> <span>You are here</span></div>')
          .openPopup();

        map.value.setView(userLatLng.value, 10);
        updateMarkers();
      },
      () => updateMarkers()
    );
  } else {
    updateMarkers();
  }
}

// Watch radius changes and update markers
watch(radius, updateMarkers);

// Add markers to map and filter events
function updateMarkers() {
  eventMarkers.value.forEach((m) => map.value.removeLayer(m));
  eventMarkers.value = [];
  visibleEvents.value = [];

  eventsData.value.forEach((event) => {
    const eventLatLng = [event.lat, event.lng];
    let withinRadius = true;

    if (userLatLng.value && radius.value > 0) {
      const d = getDistance(userLatLng.value, eventLatLng);
      withinRadius = d <= radius.value;
    }

    if (withinRadius) {
      visibleEvents.value.push(event);
      const marker = L.marker(eventLatLng, {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [35, 35],
        }),
      })
        .addTo(map.value)
        .on("click", () => {
          selectedEvent.value = event;
        });

      eventMarkers.value.push(marker);
    }
  });

  accessibleMessage.value = `${visibleEvents.value.length} events found within ${radius.value} kilometers.`;
}

//Calculating distance in km between two lat/lng
function getDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function averageRating(ratings) {
  if (!ratings.length) return "No ratings";
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return avg.toFixed(1);
}

function openModal(event) {
  selectedEvent.value = event;
}

function closeModal() {
  selectedEvent.value = null;
}
</script>

<style scoped>
.map {
  height: 350px;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.event-list {
  width: 100%;
  background: #cafeff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #ffffff;
  border-radius: 10px;
  padding: 1.5rem;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}


.list-group-item:hover {
  background-color: #3ea5ff;
  cursor: pointer;
}
</style>