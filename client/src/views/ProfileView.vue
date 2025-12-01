<template>
  <div class="profile-page">
    <div v-if="store.user" class="profile-card">
      <img class="profile-photo" :src="'http://localhost:3000' + store.user.images_paths[0]" alt="Profile" />

      <h1 class="profile-name">{{ store.user.name }}, {{ store.age }}</h1>
      <p class="profile-desc">Miłośniczka koni  i długich przejażdżek o zachodzie słońca 🌅</p>

      <div class="buttons">
        <button class="edit-btn">Edit profile</button>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </div>
    <div v-else class="profile-card">
      <h1>Ładowanie...</h1>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const store = useUserStore();

onMounted(async () => {
  if (!store.user) {
    await store.loadUser();
  }
});

async function logout() {
  store.logout();
  await fetch("http://localhost:3000/api/auth/logout", {
  method: "POST",
  credentials: "include"
  });
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
}

/* Główna karta profilu */
.profile-card {
  background: white;
  width: 380px;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Zdjęcie użytkownika */
.profile-photo {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid #e67da8;
}

/* Imię i opis */
.profile-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #a94e74;
  margin-bottom: 0.5rem;
}

.profile-desc {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.4;
}

/* Przyciski */
.buttons {
  display: flex;
  gap: 1rem;
}

.edit-btn,
.logout-btn {
  border: none;
  border-radius: 40px;
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
}

/* Edit */
.edit-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white;
}

.edit-btn:hover {
  transform: scale(1.05);
}

/* Logout */
.logout-btn {
  background: #f3f3f3;
  color: #a94e74;
}

.logout-btn:hover {
  background: #f7dbe7;
  transform: scale(1.05);
}
</style>
