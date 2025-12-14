import { createRouter, createWebHistory } from 'vue-router'

// import widoków
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupStep1 from '../views/SignupStep1.vue'
import SignupStep2 from '../views/SignupStep2.vue'
import SignupStep3 from '../views/SignupStep3.vue'
import ProfileView from '../views/ProfileView.vue'
import RankingView from '../views/RankingView.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' }, // domyślnie przenosi do logowania

    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup/step1', name: 'signup-step1', component: SignupStep1 },
    { path: '/signup/step2', name: 'signup-step2', component: SignupStep2 },
    { path: '/signup/step3', name: 'signup-step3', component: SignupStep3 },
    { path: '/profile', name: 'profile', component: ProfileView, meta: {requiresAuth: true} },
    { path: '/ranking', name: 'ranking', component: RankingView, meta: {requiresAuth: true} }, //Narazie bez wymogu logowania, bo nie działało mi logowanie, więc trzeba zmienić to później

    // zostawiamy "home" na przyszłość, np. do ekranu głównego po zalogowaniu
    { path: '/home', name: 'home', component: HomeView },

    // opcjonalnie: fallback
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

export default router
