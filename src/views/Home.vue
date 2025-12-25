<template>
  <main class="home-page" role="main">
    <section
      class="hero text-center text-white d-flex align-items-center justify-content-center"
      aria-labelledby="homeHeading"
      :style="{ backgroundImage: `url(${currentImage})` }"
    >
          <!--  overlay for text readability -->
      <div class="overlay"></div>
      <div class="container position-relative z-2">
        <h1 id="homeHeading" class="display-4 fw-bold fade-in">
          Join the Movement. Stay Active. Stay Connected.
        </h1>
        <p class="lead fade-in-delay">
          Discover programs, events, and a community built for you.
        </p>
        <div class="mt-4 fade-in-delay-2">
          <router-link
            to="/program"
            class="btn btn-primary btn-lg me-3"
            aria-label="Explore available fitness and sports programs"
          >
            <i class="bi bi-bicycle me-2"></i> Explore Programs
          </router-link>
          
        </div>
      </div>
    </section>

    <section class="image-showcase py-5 bg-light text-center">
      <div class="container">
        <h2 class="fw-bold mb-4">Find Your Fitness Passion</h2>
        <div class="row justify-content-center">
          <div class="col-md-5 mb-4 mb-md-0">
            <img
              src="@/assets/fit1.png"
              alt="Group of people running outdoors representing SportyTribe community"
              class="img-fluid rounded-4 shadow-sm showcase-img"
            />
          </div>
          <div class="col-md-5">
            <img
              src="@/assets/fit2.png"
              alt="Individual training in a gym representing personal growth"
              class="img-fluid rounded-4 shadow-sm showcase-img"
            />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// Home Page Logic
import { ref, onMounted, onBeforeUnmount } from 'vue'

import img1 from '@/assets/fitbg.png'
import img2 from '@/assets/fitbg2.png'
import img3 from '@/assets/fitbg3.png'

const images = [img1, img2, img3]

const currentIndex = ref(0)
const currentImage = ref(images[currentIndex.value])
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
    currentImage.value = images[currentIndex.value]
  }, 5000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 80vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 1s ease-in-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  padding: 4rem 1rem;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.z-2 {
  position: relative;
  z-index: 2;
}

.fade-in { opacity: 0; animation: fadeIn 1s ease forwards; }
.fade-in-delay { opacity: 0; animation: fadeIn 1.5s ease forwards; animation-delay: 0.3s; }
.fade-in-delay-2 { opacity: 0; animation: fadeIn 1.8s ease forwards; animation-delay: 0.6s; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0);} from { opacity: 0; transform: translateY(15px);} }

.image-showcase { background: #f9fafb; }
.showcase-img { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.showcase-img:hover { transform: scale(1.03); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }

a:focus, button:focus { outline: 3px solid #fbc02d; outline-offset: 3px; }

@media (max-width: 768px) {
  .hero h1 { font-size: 2rem; }
  .hero p { font-size: 1.1rem; }
}
</style>
