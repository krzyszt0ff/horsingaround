<template>
  <div class="ranking-page">
    <div class="ranking-card">
      
      <div class="header-section">
        <h1 class="title-top">The Hottest</h1>
        <h1 class="title-bottom">Users Near You</h1>
      </div>

      <div class="tabs-container">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'likes' }" 
          @click="switchTab('likes')"
        >
          Top Likes ♥
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'matches' }" 
          @click="switchTab('matches')"
        >
          Top Matches 🔥
        </button>
      </div>

      <div v-if="loading" class="status-message">
        Ładowanie rankingu...
      </div>
      
      <div v-else-if="error" class="status-message error">
        {{ error }}
      </div>

<div v-else class="list-container">
  <ul class="ranking-list">
    <li 
      v-for="(user, index) in rankingList" 
      :key="user.id" 
      class="ranking-item"
      @click="openProfile(user)"
      style="cursor: pointer;"
    >
      <div class="left-content">
        <div class="rank-icon-wrapper">
          <img :src="getRankAsset(index)" :alt="`Rank ${index + 1}`" class="rank-img" />
        </div>
        <span class="user-name">{{ user?.name || 'Użytkownik' }}</span>
      </div>

      <div class="right-content">
        <span class="heart">{{ activeTab === 'likes' ? '♥' : '🔥' }}</span>
        <span class="votes">{{ user.count }}</span>
      </div>
    </li>
  </ul>
    <Transition name="fade">
  <div v-if="isProfileOpen" class="profile-modal-overlay">
    
    <div class="modal-backdrop" @click="closeProfile"></div>

    <div class="profile-modal-content">
      <ProfileCard 
        v-if="selectedUserForPreview" 
        :user="selectedUserForPreview" 
      />
    </div>

  </div>
</Transition>
</div>

      <FilterPopup
        :is-open="isModalOpen"
        v-model:gender="selectedGender"
        v-model:age-range="selectedAgeRange"
        @close="isModalOpen = false"
        @apply="fetchRanking" />

      <button class="filter-toggle-btn" @click="isModalOpen = true">Filtruj 🛠️</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import FilterPopup from '../components/stats/FilterPopup.vue';
  import ProfileCard from '../components/ProfileCard.vue';
  import { SERVER_BASE_URL } from "@/config/env";

  const rankingList = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const activeTab = ref('likes');
  const BASE_API_URL = SERVER_BASE_URL;

  const selectedUserForPreview = ref(null);
  const isProfileOpen = ref(false);
  const isModalOpen = ref(false);
  const selectedGender = ref('all');
  const selectedAgeRange = ref([18, 99]);

  const fetchRanking = async () => {
    try {
      loading.value = true;
      error.value = null;
      rankingList.value = [];

      const [min, max] = selectedAgeRange.value;
      const gender = selectedGender.value;

      
      const url = `${BASE_API_URL}/api/matches/rank/${activeTab.value}/${gender}?minAge=${min}&maxAge=${max}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
          if (response.status === 401) throw new Error("Musisz być zalogowany.");
          throw new Error(`Błąd HTTP: ${response.status}`);
      }

      const json = await response.json();
      const calculateAge = (birthday) => {
          const ageDifMs = Date.now() - new Date(birthday).getTime();
          const ageDate = new Date(ageDifMs);
          return Math.abs(ageDate.getUTCFullYear() - 1970);
        };

    if (json.success && Array.isArray(json.data)) {
      rankingList.value = json.data
      .filter(item => item && item.user_info)
      .map(item => ({
      id: item.user_info._id,
      name: item.user_info.name || 'Użytkownik',
      age: item.user_info.age || '?', 
      bio: item.user_info.bio || 'Brak opisu',
      images_paths: item.user_info.images_paths || [], 
      count: item.likesCounter || item.matchesCounter || 0,
      age: item.user_info.date_of_birth ? calculateAge(item.user_info.date_of_birth) : '?'
    }));
} else {
        error.value = "Nie udało się pobrać danych.";
      }
      

    } catch (err) {
      console.error(err);
      error.value = err.message || "Błąd połączenia.";
    } finally {
      loading.value = false;
    }
  };

  const openProfile = (user) => {
    selectedUserForPreview.value = user;
    isProfileOpen.value = true; 
  };

  const closeProfile = () => {
    isProfileOpen.value = false;
    selectedUserForPreview.value = null;
  };
  const switchTab = (tabName) => {
    if (activeTab.value === tabName) return;
    activeTab.value = tabName;
    selectedGender.value = 'all';
    selectedAgeRange.value = [18, 99];
    fetchRanking(); 
  };

  const getRankAsset = (index) => {
    let filename = 'rank-default.png'; 
    if (index === 0) filename = 'rank-1-gold.png'; 
    else if (index === 1) filename = 'rank-2-silver.png'; 
    else if (index === 2) filename = 'rank-3-bronze.png'; 
    
    return new URL(`../assets/${filename}`, import.meta.url).href;
  };

  onMounted(() => {
    fetchRanking();
  });
</script>

<style scoped>

.ranking-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
}

.ranking-card {
  position: relative; 
  background: white;
  width: 600px;
  background: white;
  width: 600px;
  height: 90vh; 
  max-height: 800px;
  padding: 2rem 0; 
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-section {
  text-align: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0; 
}
.tabs-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
  flex-shrink: 0;
}

.tab-btn {
  background: transparent;
  border: 2px solid #f0f0f0;
  border-radius: 20px;
  padding: 8px 20px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #e67da8;
  color: white;
  border-color: #e67da8;
  box-shadow: 0 4px 10px rgba(230, 125, 168, 0.3);
}

.tab-btn:hover:not(.active) {
  border-color: #e67da8;
  color: #e67da8;
}
.title-top {
  font-size: 2rem;
  font-weight: 600;
  color: #e67da8;
  margin: 0;
  line-height: 1.1;
}

.title-bottom {
  font-size: 1.8rem;
  font-weight: 600;
  color: #e67da8; 
  margin: 0;
  line-height: 1.1;
}

.list-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1.5rem; 
  
  scrollbar-width: thin;
  scrollbar-color: #e67da8 #fff;

  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.left-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(0,0,0,0.1));
}

.user-name {
  font-weight: 700;
  font-size: 1rem;
  color: #000;
}

.right-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 5px;
}

.heart {
  color: #c75b85; 
  font-size: 1.2rem;
}

.votes {
  color: #000;
  font-size: 0.95rem;
}

.filter-toggle-btn {

  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;

  background: transparent;
  border: 2px solid #f0f0f0;
  border-radius: 20px;
  padding: 8px 20px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-toggle-btn.active {
  background: #e67da8;
  color: white;
  border-color: #e67da8;
  box-shadow: 0 4px 10px rgba(230, 125, 168, 0.3);
}

.tab-btn:hover:not(.active) {
  border-color: #e67da8;
  color: #e67da8;
}

.profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: -1; 
}

.profile-modal-content {
  position: relative;
  z-index: 10000;
  pointer-events: auto; 
}
:deep(.card) {
  position: relative !important;
  top: unset !important;
  left: unset !important;
  margin: 0 auto;
}

.close-profile-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #e67da8;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>
