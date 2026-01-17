<template>
  <main class="main-page">
    <div v-if="loading" class="loading">Ładowanie...</div>

    <div v-else-if="users.length === 0" class="no-users">
      Brak nowych użytkowników do pokazania 
    </div>

    <div
      v-else
      class="card"
      v-for="(user, index) in users"
      :key="user._id"
      v-show="currentIndex === index && !endOfUsers"
    >
      
      <div class="image-container">
        <div class="photo-bars">
            <div 
                v-for="(img, idx) in user.images_paths" 
                :key="idx"
                class="bar"
                :class="{ active: idx === currentImageIndex }"
            ></div>
        </div>

        <img 
            class="profile-photo" 
            :src="'http://localhost:3000' + user.images_paths[currentImageIndex]" 
            alt="Profile" 
        />
        
        <div class="click-zone left" @click.stop="prevPhoto"></div>
        <div class="click-zone right" @click.stop="nextPhoto"></div>
      </div>

      <div class="bottom-panel">
        
        <div class="panel-header" @click.stop="toggleInfo">
            <div class="header-content">
                <h2>{{ user.name }}, {{ user.age }}</h2>
            </div>
            
            <button class="toggle-btn">
                <FontAwesomeIcon :icon="isExpanded ? 'chevron-down' : 'chevron-up'" />
            </button>
        </div>

        <div class="description-wrapper" :class="{ open: isExpanded }">
            <div class="description-inner">
                <p class="desc">{{ user.bio }}</p>
            </div>
        </div>

        <div class="panel-buttons">
            <button class="dislike" @click.stop="dislike">
                <FontAwesomeIcon icon="x" class="icon"/>
            </button>
            <button class="like" @click.stop="like">
                <FontAwesomeIcon icon="heart" class="icon"/>
            </button>
        </div>

      </div>
    </div>

    <div v-if="endOfUsers" class="no-users">
       To już wszyscy użytkownicy w Twojej okolicy.
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const store = useUserStore();
const users = ref([]);
const loading = ref(true);
const currentIndex = ref(0);
const endOfUsers = ref(false);

const currentImageIndex = ref(0);
const isExpanded = ref(false);

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/users?page=1', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
      users.value = data.data.filter(u => u.user_id !== store.user.userId);
    }
  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    loading.value = false;
  }
});

function nextPhoto() {
  const user = users.value[currentIndex.value];
  if (user.images_paths && currentImageIndex.value < user.images_paths.length - 1) {
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

function nextCard() {
  if (currentIndex.value < users.value.length - 1) {
    currentIndex.value++;
    currentImageIndex.value = 0; 
    isExpanded.value = false; 
  } else {
    endOfUsers.value = true;
  }
}

async function like() {
  const user = users.value[currentIndex.value];
  const res = await fetch(`http://localhost:3000/api/users/${user.user_id}/like`, {
      method: 'POST', credentials: 'include'
  });
  const data = await res.json();
  if (data.match_created) alert('🔥 MATCH!');
  nextCard();
}

function dislike() {
  nextCard();
}
</script>

<style scoped>
.card {
  width: 480px;
  height: 760px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
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

.profile-photo {
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
  font-size: 1.5rem;
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
  margin-bottom: 0.5rem;
  
  max-height: 200px; 
  overflow-y: auto;
}

.panel-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0 1.5rem 0;
  background: white; 
}

.dislike, .like {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  font-size: 1.6rem;
  border: 3px solid;
  background: white;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dislike { border-color: #ff7b7b; color: #ff7b7b; }
.like { border-color: #6fcf97; color: #6fcf97; }
.dislike:hover { background: #ff7b7b; color: white; transform: scale(1.1); }
.like:hover { background: #6fcf97; color: white; transform: scale(1.1); }

@media (width <= 650px) {
  .card {
    height: 65vh;
    width: 90vw;
    max-width: 400px;
    margin-bottom: 6rem;
  }
}
.no-users {
  font-size: 1.2rem;
  color: #a94e74;
  text-align: center;
  padding: 2rem;
  background: #ffe6f0;
  border-radius: 16px;
  max-width: 350px;
  margin: 0 auto;
}
</style>