<template>
  <div class="profile-page-container">
    
    <div v-if="!store.user" class="loading">
      Ładowanie profilu...
    </div>

    <div v-else class="card">
      
      <div class="image-container">
        <div class="photo-bars">
            <div 
                v-for="(img, idx) in store.user.images_paths" 
                :key="idx"
                class="bar"
                :class="{ active: idx === currentImageIndex }"
            ></div>
        </div>

        <img 
            class="profile-photo-bg" 
            :src="'http://localhost:3000' + store.user.images_paths[currentImageIndex]" 
            alt="Profile" 
        />
        
        <div class="click-zone left" @click.stop="prevPhoto"></div>
        <div class="click-zone right" @click.stop="nextPhoto"></div>
      </div>

      <div class="bottom-panel">
        
        <div class="panel-header" @click.stop="toggleInfo">
            <div class="header-content">
                <h2>{{ store.user.name }}, {{ store.age }}</h2>
            </div>
            
            <button class="toggle-btn">
                <FontAwesomeIcon :icon="isExpanded ? 'chevron-down' : 'chevron-up'" />
            </button>
        </div>

        <div class="description-wrapper" :class="{ open: isExpanded }">
            <div class="description-inner">
                <p class="desc">{{ store.user.bio }}</p>
            </div>
        </div>

        <div class="panel-buttons">
            <button class="edit-btn" @click="$router.push('/profile/edit')">
                Edit profile
            </button>
            <button class="logout-btn" @click="logout">
                Logout
            </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useUserStore();

const currentImageIndex = ref(0);
const isExpanded = ref(false);

onMounted(async () => {
  await store.loadUser();
});

function nextPhoto() {
  if (store.user && store.user.images_paths && currentImageIndex.value < store.user.images_paths.length - 1) {
    currentImageIndex.value++;
  }
}

function prevPhoto() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
}

function toggleInfo() {
  isExpanded.value = !isExpanded.value;
}

async function logout() {
  try {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    store.logout();
    router.push('/');
  } catch (err) {
    console.error('Logout failed', err);
  }
}
</script>

<style scoped>
.profile-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh; 
}

.card {
  width: 480px;
  height: 760px; 
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #222;
}

.profile-photo-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-bars {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  z-index: 11;
  pointer-events: none;
}
.bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  backdrop-filter: blur(2px);
}
.bar.active { background: white; box-shadow: 0 0 2px rgba(0,0,0,0.5); }

.click-zone {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  z-index: 10;
  cursor: pointer;
}
.click-zone.left { left: 0; }
.click-zone.right { right: 0; }

.bottom-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 20;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  cursor: pointer;
}

.header-content h2 {
  color: #a94e74;
  font-size: 1.6rem;
  margin: 0;
  font-weight: 700;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  transition: 0.3s;
}
.toggle-btn:hover { color: #a94e74; }

.description-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease-out;
  padding: 0 1.5rem;
}

.description-wrapper.open {
  grid-template-rows: 1fr;
}

.description-inner {
  overflow: hidden;
}

.desc {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.panel-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  background: white;
  margin-top: auto; 
}

.edit-btn,
.logout-btn {
  border: none;
  border-radius: 40px;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  flex: 1; 
  max-width: 140px; 
}

.edit-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white;
  box-shadow: 0 4px 10px rgba(230, 125, 168, 0.3);
}

.edit-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(230, 125, 168, 0.4);
}

.logout-btn {
  background: #f3f3f3;
  color: #a94e74;
}

.logout-btn:hover {
  background: #f7dbe7;
  transform: scale(1.05);
}

.loading {
    font-size: 1.2rem;
    color: #888;
}
@media (width <= 650px) {
  .card {
    height: 70vh;
    width: 90vw;
    max-width: 400px;
  }
}
</style>