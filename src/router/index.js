import { createRouter, createWebHistory } from 'vue-router'
import Program from '../views/Program.vue'
import Home from '@/views/Home.vue'
import FirebaseSigninView from "@/views/FirebaseSigninView.vue"
import FirebaseRegisterView from "@/views/FirebaseRegisterView.vue"
import AdminLogin from '@/views/AdminLogin.vue'
import AdminReg from '@/views/AdminReg.vue'
import Contact from '@/views/Contact.vue'
import AdminUserEventsList from '@/views/AdminUserEventsList.vue'
import NearbyEvents from '@/views/NearbyEvents.vue'
import Resources from '@/views/Resources.vue'
import DetailedResources from '@/views/DetailedResources.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import Calendar from '@/views/Calendar.vue'
import AdminEventCancel from '@/views/AdminEventCancel.vue'


const routes = [
   {
    path: '/',    
    name: 'Home',
    component: Home,
    meta: { title: "Home - SportyTribe" }
  },
   {
    path: '/home',
    redirect: '/'  
  },
  {
    path: '/program',   
    name: 'Program',
    component: Program
  },
   {
    path: '/admineventcancel',   
    name: 'AdminEventCancel',
    component: AdminEventCancel
  },
  {
    path: '/calendar',   
    name: 'Calendar',
    component: Calendar
  },
   {
    path: '/admindashboard',   
    name: 'AdminDashboard',
    component: AdminDashboard
  },
   {
    path: '/resources',   
    name: 'Resources',
    component: Resources
  },
   {
    path: "/resources/:id",   
    name: 'DetailedResources',
    component: DetailedResources,
     props: true,
  },
   {
    path: '/nearbyevents',   
    name: 'NearbyEvents',
    component: NearbyEvents
  },
  {
    path: '/adminusereventslist',   
    name: 'AdminUserEventsList',
    component: AdminUserEventsList
  },
   {
    path: '/firelogin',
    name: 'FireLogin',
    component: FirebaseSigninView  
  },
  {
    path: '/fireregister',
    name: 'FireRegister',
    component: FirebaseRegisterView  
  },
  {
    path: '/adminlogin',
    name: 'AdminLogin',
    component: AdminLogin  
  },
  {
    path: '/adminreg',
    name: 'AdminReg',
    component: AdminReg  
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact  
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title || "SportyTribe";
});


export default router
