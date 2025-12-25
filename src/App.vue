<script setup>
import Headernav from './components/headernav.vue';
import SportyBot from "@/components/SportyBot.vue"

</script>
<template>
      <div class = "main-container bg-light min-vh-100">
      <a href="#mainContent" class="skip-link">Skip to the main content</a>
        <header>
      <Headernav />
    </header>

    <main id="mainContent" class="main-content py-4" role="main" tabindex="-1">
    <router-view/>
        <SportyBot />

  </main>
    <footer class="footer text-center py-3">
      <small>&copy; 2025 SportyTribe</small>
    </footer>
  </div>
</template>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff, #ffffff);
}
.skip-link {
  position: absolute;
  top: -40px;
  left: 10px;
  background: #004aad;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s ease;
}
.main-content:focus {
  outline: 3px solid #ffeb3b;
  outline-offset: 4px;
}
.skip-link:focus {
  top: 10px;
}

nav.navbar {
  margin: 0;
  padding: 0;
  
}

main {
  flex: 1;
  padding-top: 2rem;
}
.sportybot-widget {
  position: relative;
  z-index: 9999;
}

</style>
