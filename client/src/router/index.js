import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "@/stores/user";

// import widoków
import HomeView from '../views/HomeView.vue'
import LandingPageView from '../views/LandingPageView.vue'
import SignupStep1 from '../views/SignupStep1.vue'
import SignupStep2 from '../views/SignupStep2.vue'
import SignupStep3 from '../views/SignupStep3.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LandingPageView }, // domyślnie przenosi do logowania

    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup/step1', name: 'signup-step1', component: SignupStep1 },
    { path: '/signup/step2', name: 'signup-step2', component: SignupStep2 },
    { path: '/signup/step3', name: 'signup-step3', component: SignupStep3 },
    { path: '/profile', name: 'profile', component: ProfileView, meta: {requiresAuth: true} },

    // zostawiamy "home" na przyszłość, np. do ekranu głównego po zalogowaniu
    { path: '/home', name: 'home', component: HomeView },

    // opcjonalnie: fallback
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})


// Global Guard, pilnuje czy użytkownik jest zalogowany
router.beforeEach(async (to, from, next) => {
  const store = useUserStore();

  const publicRoutes = ["/", "/login", "/signup/step1", "/signup/step2", "/signup/step3"];

  if (publicRoutes.includes(to.path)) {
    return next();
  }

  if (!store.user) {
    await store.loadUser();
  }

  if (to.meta.requiresAuth && !store.user) {
    return next("/login"); // nie zalogowany → przekieruj
  }

  next();
});

export default router
