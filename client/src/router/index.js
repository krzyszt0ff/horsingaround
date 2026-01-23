import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "@/stores/user";

// import widoków
import MainView from '../views/MainView.vue'
import LandingPageView from '../views/LandingPageView.vue'
import SignupStep1 from '../views/SignupStep1.vue'
import SignupStep2 from '../views/SignupStep2.vue'
import SignupStep3 from '../views/SignupStep3.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
//
import EditProfileView from '../views/EditProfileView.vue'
import RankingView from '@/views/RankingView.vue';
//
import ChatView from '@/views/ChatView.vue'
//

export const publicRoutes = ["/", "/login", "/signup/step1", "/signup/step2", "/signup/step3"];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // domyślnie przenosi na landing page
    { path: '/', component: LandingPageView},

    { path: '/app', name: 'main', component: MainView, meta: {requiresAuth: true} },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup/step1', name: 'signup-step1', component: SignupStep1 },
    { path: '/signup/step2', name: 'signup-step2', component: SignupStep2 },
    { path: '/signup/step3', name: 'signup-step3', component: SignupStep3 },
    { path: '/profile', name: 'profile', component: ProfileView, meta: {requiresAuth: true} },

    { path: '/profile/edit', name: 'edit-profile', component: EditProfileView, meta: {requiresAuth: true} },

    { path: '/ranking', name: 'ranking', component: RankingView, meta: {requiresAuth: true} },

    { path: '/chat', name: 'chat-contacts', component: ChatView, meta: {requiresAuth: true} },
    //DO OSOBY ZAJMUJACEJ SIE IMPLEMENTACJA CHATU: TUTAJ PO SLASHU TRZEBA BY BYLO PEWNIE DODAC JAKOS
    //ID UZYTKOWNIKA PEWNIE ALBO JAKIS HASH NWM NWM JAK NARAZIE ZOSTAWIAM TO TAK PUSTO
    // Generalnie /chat/:chatId nie bedzie potrzebne, ale ty jestes szefem i ty decydujesz o sprawach przod-koniec
    // OK!
    { path: '/chat/:chatId', name: 'chat', component: ChatView, meta: {requiresAuth: true}},

    // opcjonalnie: fallback
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})


// Global Guard, pilnuje czy użytkownik jest zalogowany
router.beforeEach(async (to, from, next) => {
  const store = useUserStore();

  if (publicRoutes.includes(to.path)) {
    return next();
  }

  if (!store.user) {
    await store.loadUser();
  }

  if (to.path === '/'){
    if (store.user){
      return next('/app') // zalogowany → main
    } else {
      return next() // niezalogowany → landing
    }
  }

  if (to.meta.requiresAuth && !store.user) {
    return next("/login"); // nie zalogowany → przekieruj
  }

  next();
});

export default router
