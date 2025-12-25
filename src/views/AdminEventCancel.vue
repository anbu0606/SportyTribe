<template>
  <div class="container mt-5">
    <div class="mb-3">
      <label for="eventSelect">Select Event to Cancel</label>
      <select id="eventSelect" v-model="selectedEvent" class="form-control">
        <option disabled value="">-- Select Event --</option>
        <option v-for="event in events" :key="event" :value="event">{{ event }}</option>
      </select>
    </div>

    <button
      class="btn btn-danger"
      :disabled="loading || !selectedEvent"
      @click="cancelEvent"
    >
      {{ loading ? "Cancelling..." : "Cancel Event & Notify Users" }}
    </button>

    <p v-if="statusMessage" :class="statusClass" class="mt-3">{{ statusMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore"

const db = getFirestore()

const events = ref([])
const selectedEvent = ref("")
const loading = ref(false)
const statusMessage = ref("")
const statusClass = ref("")

// Bulk email serverless function URL
const functionURL = "https://sendbulkeventemail-c5melirmcq-uc.a.run.app"

onMounted(async () => {
  try {
    const snapshot = await getDocs(collection(db, "adminUserEvents"))
    const uniqueEvents = new Set()
    snapshot.forEach(docSnap => {
      const data = docSnap.data()
      if (data.Event) uniqueEvents.add(data.Event)
    })
    events.value = Array.from(uniqueEvents)
  } catch (err) {
    console.error("Error fetching events:", err)
  }
})

// Cancel Event Function
const cancelEvent = async () => {
  if (!selectedEvent.value) return

  loading.value = true
  statusMessage.value = ""
  statusClass.value = ""

  try {
    // Query all participants registered for the selected event
    const q = query(
      collection(db, "adminUserEvents"),
      where("Event", "==", selectedEvent.value),
      where("Status", "==", "Registered")
    )
    const snapshot = await getDocs(q)

    // If no participants, show the warning and exit
    if (snapshot.empty) {
      statusMessage.value = "No registered participants found for this event."
      statusClass.value = "text-warning"
      loading.value = false
      return
    }

    const participants = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      return {
        email: data.email,
        name: data.name || "Participant",
      }
    })

    const eventData = snapshot.docs[0].data()
    const emailTemplate = `
Hello {{name}},

We regret to inform you that the following event has been cancelled:

Event: ${eventData.Event}
Date: ${eventData.date}
Location: ${eventData.Location}

We apologize for the inconvenience.

Best regards,
Admin Team
`

    // Send bulk email via serverless function
    const res = await fetch(functionURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participants,
        subject: `Event Cancelled: ${selectedEvent.value}`,
        text: emailTemplate,
      }),
    })

    if (!res.ok) {
      throw new Error(`Bulk email failed with status ${res.status}`)
    }

    // Update all participant statuses to "Cancelled" in Firestore
    const updatePromises = snapshot.docs.map(docSnap =>
      updateDoc(doc(db, "adminUserEvents", docSnap.id), { Status: "Cancelled" })
    )
    await Promise.all(updatePromises)

    statusMessage.value = `Event cancelled and notifications sent to ${snapshot.size} participants.`
    statusClass.value = "text-success"
  } catch (err) {
    console.error(err)
    statusMessage.value = "Error cancelling event or sending emails."
    statusClass.value = "text-danger"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.text-success {
  color: green;
}
.text-danger {
  color: red;
}
.text-warning {
  color: orange;
}

button:focus {
  outline: 3px solid #1482ff;
  outline-offset: 2px;
}
</style>
