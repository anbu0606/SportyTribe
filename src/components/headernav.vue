<template>
  <!--  role is banner for accessibility -->
  <header class="sporty-navbar shadow sticky-top" role="banner" aria-label="Site Header">
    <div class="container-fluid">
      <nav class="navbar navbar-expand-md navbar-dark" aria-label="Main Navigation">
        <div class="d-flex align-items-center">
          <img src="@/assets/runningIcon.jpg" alt="SportyTribe Logo" class="brand-icon me-2" />
          <router-link class="navbar-brand fw-bold fs-3" to="/home">SportyTribe</router-link>
        </div>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto my-2 my-md-0 text-center">
            <li class="nav-item">
              <router-link to="/home" class="nav-link px-3" active-class="active">Home</router-link>
            </li>
            
            <!-- User-Specific Links -->
            <li v-if="userRole === 'user'" class="nav-item">
              <router-link to="/program" class="nav-link px-3" active-class="active">Program</router-link>
            </li>

            <li v-if="userRole === 'user'" class="nav-item">
              <router-link to="/resources" class="nav-link px-3" active-class="active">Resources</router-link>
            </li>

            <li v-if="userRole === 'user'" class="nav-item">
              <router-link to="/calendar" class="nav-link px-3" active-class="active">Calendar</router-link>
            </li>

            <li v-if="userRole === 'user'" class="nav-item">
              <router-link to="/nearbyevents" class="nav-link px-3" active-class="active">Nearby Events</router-link>
            </li>

            <li v-if="userRole === 'user'" class="nav-item">
              <router-link to="/contact" class="nav-link px-3" active-class="active">Contact Us</router-link>
            </li>

            <!-- Admin-Specific Links -->
            <li v-if="userRole === 'admin'" class="nav-item">
              <router-link to="/admindashboard" class="nav-link px-3 text-warning fw-bold" active-class="active">Admin Dashboard</router-link>
            </li>
            <li v-if="userRole === 'admin'" class="nav-item">
              <router-link to="/adminusereventslist" class="nav-link px-3 text-warning fw-bold" active-class="active">Participant List</router-link>
            </li>
            <li v-if="userRole === 'admin'" class="nav-item">
              <router-link to="/admineventcancel" class="nav-link px-3 text-warning fw-bold" active-class="active">Event Cancel</router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center ms-md-3 text-center">
            <router-link
              v-if="!isLoggedIn"
              class="btn btn-primary me-2"
              to="/Firelogin"
              active-class="active"
            >
              Login
            </router-link>

            <button
              v-else
              class="btn btn-danger"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase/init";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const isLoggedIn = ref(false);
const userRole = ref(null);
const router = useRouter();

onMounted(() => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      isLoggedIn.value = true;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        userRole.value = docSnap.data().role;
      }
    } else {
      isLoggedIn.value = false;
      userRole.value = null;
    }
  });
});

const logout = async () => {
  try {
    await signOut(auth);
    isLoggedIn.value = false;
    userRole.value = null;
    router.push("/Firelogin");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<style scoped>
.sporty-navbar {
  background: linear-gradient(90deg, #37aa97, #298cc5);
}

.brand-icon {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.nav-link {
  color: #fff;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
  padding-bottom: 6px;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 0;
  background: #ffeb3b;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.active::after {
  width: 100%;
  background: #ffc107;
}

.btn-primary {
  background: #ff5722;
  color: #fff;
  border: none;
  border-radius: 8px;
}

.btn-primary:hover,
.btn-primary:focus {
  background: #e64a19;
}

.btn-danger {
  border-radius: 8px;
}

.navbar-brand {
  color: #00eaff;
}

.nav-link:focus,
.btn:focus {
  outline: 3px solid #ffeb3b;
  outline-offset: 3px;
}

@media (max-width: 768px) {
  .navbar-nav {
    margin-top: 1rem;
  }
  .d-flex.align-items-center.ms-md-3 {
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>
