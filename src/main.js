import './assets/main.css'
import './style.css'

import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'

import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'

import Aura from '@primeuix/themes/aura'
import Rating from 'primevue/rating'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import router from './router'
import 'leaflet/dist/leaflet.css'


const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false
    }
  }
})
app.use(router)
app.use(PrimeVue)
app.component('InputText', InputText)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Rating', Rating)

app.mount('#app')


