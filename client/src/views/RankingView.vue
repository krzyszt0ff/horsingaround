<template>
  <div class="ranking-page">
    <div class="ranking-card">
      
      <div class="header-section">
        <h1 class="title-top">The Hottest</h1>
        <h1 class="title-bottom">Users Near You</h1>
      </div>

      <div class="list-container">
        <ul class="ranking-list">
          <li v-for="(user, index) in rankingList" :key="user.id" class="ranking-item">
            
            <div class="left-content">
              <div class="rank-icon-wrapper">
                <img :src="getRankAsset(index)" :alt="`Rank ${index + 1}`" class="rank-img" />
              </div>
              
              <span class="user-name">{{ user.name }}</span>
            </div>

            <div class="right-content">
              <span class="heart">♥</span>
              <span class="votes">{{ user.votes }}</span>
            </div>

          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
//Narazie na sztywno <3
const rankingList = ref([
  { id: 1, name: 'Bojack Horseman', votes: 4202 },
  { id: 2, name: 'Agnieszka', votes: 1213 },
  { id: 3, name: 'Mama Agnieszki', votes: 767 },
  { id: 4, name: 'Osoba Bożeńska', votes: 500 },
  { id: 5, name: 'Mustang', votes: 400 },
  { id: 6, name: 'Maryśka', votes: 300 },
  { id: 7, name: 'Joanna Błyszczyk', votes: 200 },
  { id: 8, name: 'Babcia Agnieszki', votes: 100 },
]);
const getRankAsset = (index) => {
    let filename = 'rank-default.png'; 
  if (index === 0) filename = 'rank-1-gold.png'; 
  else if (index === 1) filename = 'rank-2-silver.png'; 
  else if (index === 2) filename = 'rank-3-bronze.png'; 
  return new URL(`../assets/${filename}`, import.meta.url).href;
};
</script>

<style scoped>
.ranking-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
}

.ranking-card {
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
</style>
