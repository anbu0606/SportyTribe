<template>
  <main class="container py-5">
    <p class="text-muted">
      Click an event to book or cancel. You can only have one booking per date.
    </p>

    <div v-if="loading" class="alert alert-info mt-3" role="status">
      Loading events from Firestore...
    </div>

    <div v-else id="calendar" ref="calendarRef"></div>

    <p v-if="statusMessage" :class="statusClass" class="mt-3" aria-live="polite">
      {{ statusMessage }}
    </p>

    <div v-if="showBookingForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <h5>Confirm Booking for {{ selectedEvent?.title }}</h5>
        <p>
          Date: <strong>{{ selectedEventDate }}</strong><br />
          Location:
          <strong>{{ selectedEvent?.extendedProps?.location }}</strong>
        </p>

        <form @submit.prevent="submitBooking">
          <div class="mb-3">
            <label for="name" class="form-label">Full Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-control"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="mb-3">
            <label for="gender" class="form-label">Gender</label>
            <select id="gender" v-model="formData.gender" class="form-select" required>
              <option disabled value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="closeForm">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Confirm Booking</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCancelForm" class="modal-overlay" @click.self="closeCancel">
      <div class="modal-content">
        <h5>Cancel Booking for {{ cancelEvent?.Event }}</h5>
        <p>
          Date: <strong>{{ cancelEvent?.date }}</strong><br />
          Location: <strong>{{ cancelEvent?.Location }}</strong>
        </p>
        <p class="text-danger mb-4">
          Are you sure you want to cancel this booking?
        </p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="closeCancel">No</button>
          <button class="btn btn-danger" @click="confirmCancel">Yes, Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/firebase/init"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { getAuth } from "firebase/auth"
import { format } from "date-fns"

const calendarRef = ref(null)
const events = ref([])
const userBookings = ref([])
const loading = ref(true)
const statusMessage = ref("")
const statusClass = ref("")
const auth = getAuth()

const showBookingForm = ref(false)
const formData = ref({ name: "", gender: "" })
const selectedEvent = ref(null)
const selectedEventDate = ref("")

const showCancelForm = ref(false)
const cancelEvent = ref(null)
const cancelEventRef = ref(null)
const cancelCalendarEvent = ref(null)

let calendarInstance = null

watch([calendarRef, events], ([refEl, ev]) => {
  if (refEl && refEl instanceof HTMLElement && ev.length > 0) initCalendar()
})

onMounted(async () => {
  const user = auth.currentUser
  try {
    const programSnapshot = await getDocs(collection(db, "programdetails"))
    const allEvents = programSnapshot.docs.map((doc) => {
      const data = doc.data()
      const startDate = format(new Date(data.date), "yyyy-MM-dd")
      return {
        id: doc.id,
        title: data.name,
        start: startDate,
        extendedProps: { location: data.location },
        backgroundColor: "#007bff",
      }
    })

    if (user) {
      const bookingsRef = collection(db, "adminUserEvents")
      const q = query(bookingsRef, where("email", "==", user.email))
      const bookingSnap = await getDocs(q)
      userBookings.value = bookingSnap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      }))

      userBookings.value.forEach((b) => {
        const bookedDate = format(new Date(b.date), "yyyy-MM-dd")
        const bookedEvent = allEvents.find((e) => e.start === bookedDate)
        if (bookedEvent)
          bookedEvent.backgroundColor =
            b.Status === "Cancelled" ? "#dc3545" : "#28a745"
      })
    }

    events.value = allEvents
  } catch (err) {
    console.error("Error loading events:", err)
    statusMessage.value = "Error loading events."
    statusClass.value = "text-danger"
  } finally {
    loading.value = false
  }
})

function initCalendar() {
  if (!calendarRef.value) return
  if (calendarRef.value.dataset.initialized) return
  calendarRef.value.dataset.initialized = "true"

  calendarInstance = new Calendar(calendarRef.value, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    events: events.value,
    eventClick: handleEventClick,
    height: 600,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,dayGridWeek",
    },
  })
  calendarInstance.render()
}

async function handleEventClick(info) {
  const user = auth.currentUser
  if (!user) {
    statusMessage.value = "Please log in to book or cancel events."
    statusClass.value = "text-warning"
    return
  }

  const event = info.event
  const selectedDate = format(new Date(event.startStr), "MM/dd/yyyy")
  const adminUserEventsRef = collection(db, "adminUserEvents")

  try {
    const q = query(
      adminUserEventsRef,
      where("email", "==", user.email),
      where("date", "==", selectedDate)
    )
    const existingBookingSnap = await getDocs(q)

    if (!existingBookingSnap.empty) {
      const bookingDoc = existingBookingSnap.docs[0]
      const bookingId = bookingDoc.id
      const bookingData = bookingDoc.data()

      if (bookingData.Status === "Cancelled") {
        statusMessage.value = "This event was already cancelled."
        statusClass.value = "text-muted"
        return
      }

      cancelEvent.value = bookingData
      cancelEventRef.value = bookingId
      cancelCalendarEvent.value = event
      showCancelForm.value = true
      return
    }

    selectedEvent.value = event
    selectedEventDate.value = selectedDate
    showBookingForm.value = true
  } catch (err) {
    console.error("Booking failed:", err)
    statusMessage.value = "Booking failed. Try again."
    statusClass.value = "text-danger"
  }
}

async function confirmCancel() {
  try {
    await updateDoc(doc(db, "adminUserEvents", cancelEventRef.value), {
      Status: "Cancelled",
    })
    cancelCalendarEvent.value.setProp("backgroundColor", "#dc3545")
    statusMessage.value = `Booking cancelled for ${cancelEvent.value.Event}.`
    statusClass.value = "text-danger"
  } catch (err) {
    console.error("Cancel failed:", err)
    statusMessage.value = "Cancellation failed. Try again."
    statusClass.value = "text-danger"
  } finally {
    showCancelForm.value = false
    cancelEvent.value = null
  }
}

async function submitBooking() {
  const user = auth.currentUser
  if (!user) return

  const { name, gender } = formData.value
  const event = selectedEvent.value
  const date = selectedEventDate.value

  if (!name.trim() || !gender.trim()) {
    statusMessage.value = "Please fill in all fields."
    statusClass.value = "text-warning"
    return
  }

  try {
    await addDoc(collection(db, "adminUserEvents"), {
      name,
      gender,
      email: user.email,
      Event: event.title,
      date,
      Location: event.extendedProps.location,
      Status: "Registered",
    })

    event.setProp("backgroundColor", "#28a745")
    statusMessage.value = `Successfully booked: ${event.title}`
    statusClass.value = "text-success"
  } catch (err) {
    console.error("Booking failed:", err)
    statusMessage.value = "Booking failed. Try again."
    statusClass.value = "text-danger"
  } finally {
    showBookingForm.value = false
    formData.value = { name: "", gender: "" }
  }
}

function closeForm() {
  showBookingForm.value = false
  formData.value = { name: "", gender: "" }
}

function closeCancel() {
  showCancelForm.value = false
  cancelEvent.value = null
}
</script>

<style scoped>
#calendar {
  max-width: 900px;
  margin: 2rem auto;
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.text-success {
  color: #007a00;
}
.text-warning {
  color: #b58900;
}
.text-danger {
  color: #b30000;
}
.text-muted {
  color: #555;
}
.text-info {
  color: #ccff00;
}
</style>
