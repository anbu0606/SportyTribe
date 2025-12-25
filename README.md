# SportyTribe — Community Sport Event Booking

**SportyTribe** is a modern, accessible event-discovery and booking web application built with **Vue 3 (Composition API)** and **Firebase**. 

It allows users to discover nearby sporting events via interactive maps, manage bookings through a dynamic calendar, visualize analytics, and interact with an AI assistant. The application is designed for performance and scalability, utilizing serverless architecture for backend processes.

---

## 🚀 Overview

* **Frontend:** Vue 3 + Vite (Composition API), PrimeVue + Bootstrap for UI.
* **Backend:** Firebase Cloud Functions (v2) for email, AI proxy, validation & scheduled jobs.
* **Database:** Firestore for program details, user bookings, ratings & reviews.
* **AI:** Google Generative AI (Gemini) used via a secure server-side proxy.
* **Hosting:** Frontend on Cloudflare Pages; Backend on Firebase.

---

## ✨ Key Features

### 🗺️ Interactive & Discovery
* **Leaflet Maps:** Explore nearby events filtered by distance (25–200 km). Clicking markers opens a modal with full event details, ratings, and reviews.
* **Event Booking Calendar:** Powered by **FullCalendar**, users can view events, book slots, or cancel. Includes conflict prevention logic (one booking per date per user).
* **AI Assistant (SportyBot):** A built-in chat widget powered by **Google Gemini** helps users answer questions about events or preparation (e.g., "What to pack for a 10k run?").

### 🛠️ Admin & Management
* **Admin Dashboard:** Searchable, paginated **DataTable** of user events/bookings.
* **Analytics Charts:** Interactive **Chart.js** graphs using live Firestore data (e.g., registrations by location or status).
* **Export Tools:** Export booking data to **CSV** and **PDF** (via jsPDF + autoTable).
* **Bulk Communication:** Send broadcast emails to participant lists via **SendGrid**.

### ⚙️ Backend & Automation
* **Serverless Validation:** Firestore triggers automatically validate booking data.
* **Automated Scheduling:** A daily job marks past events as "Completed."
* **Secure Emailing:** Contact forms support file attachments and are routed through SendGrid via Cloud Functions.

---

## 🛠 Tech Stack

### Frontend
* **Core:** Vue 3 (Composition API), Vite, Vue Router
* **UI/UX:** PrimeVue, Bootstrap 5, Leaflet (Maps), FullCalendar
* **Data Viz:** vue-chartjs, Chart.js
* **Utilities:** date-fns, jsPDF, jspdf-autotable

### Backend & Cloud
* **Platform:** Firebase (Firestore, Auth, Hosting, Storage)
* **Compute:** Firebase Cloud Functions v2 (Node.js 20)
* **Email:** SendGrid (@sendgrid/mail)
* **AI:** Google Generative AI (Gemini)
* **Hosting:** Cloudflare Pages (Frontend), Firebase (Functions/DB)

---

## 🧱 Database Schema (Firestore)

### `programdetails` (Events)
Stores the available sporting events.
```json
{
  "name": "Gold Coast Community Ride",
  "date": "2025-10-21",
  "location": "Southport, Gold Coast",
  "lat": -28.0000,
  "lng": 153.4000,
  "description": "Community cycle ride",
  "ratings": [5, 4, 5],
  "reviews": ["Great event!"]
}



