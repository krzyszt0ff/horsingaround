<!--TEN WIDOK ZOSTAL PRZERZUCONY DO MAINVIEW ALE NIE USUWAM GO NA WSZELKI WYPADEK-->
<template>
  <div class="discover-page">
    <div v-if="loading" class="loading">Ładowanie...</div>

    <div v-else-if="users.length === 0" class="no-users">
      Brak nowych użytkowników do pokazania 
    </div>

    
    <div
      v-else
      class="swipe-card"
      v-for="(user, index) in users"
      :key="user._id"
      v-show="currentIndex === index && !endOfUsers"
    >
      <img class="profile-photo" :src="'http://localhost:3000' + user.images_paths[0]" alt="Profile" />
      <h1 class="profile-name">{{ user.name }}, {{ user.age }}</h1>
      <p class="profile-desc">Miłośniczka koni i długich przejażdżek 🌅</p>

      <div class="buttons">
        <button @click="dislike">❌</button>
        <button @click="like">❤️</button>
      </div>
    </div>

    <!-- Komunikat "koniec użytkowników" -->
    <div v-if="endOfUsers" class="no-users">
       To już wszyscy użytkownicy w Twojej okolicy, galopuj dalej
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const store = useUserStore();
const users = ref([]);
const loading = ref(true);
const currentIndex = ref(0);
const endOfUsers = ref(false);


onMounted(async () => {
  try {
   
    const res = await fetch('http://localhost:3000/api/users?page=1', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();
    console.log('Odpowiedź z backendu:', data);

    if (data.success) {
      
      users.value = data.data.filter(u => u.user_id !== store.user.userId);
    }
  } catch (err) {
    console.error('Błąd pobierania użytkowników:', err);
  } finally {
    loading.value = false;
  }
});


function nextCard() {
  if (currentIndex.value < users.value.length - 1) {
    currentIndex.value++;
  } else {
    endOfUsers.value=true;
  }
}

async function like() {
  const user = users.value[currentIndex.value];

  const res = await fetch(
    `http://localhost:3000/api/users/${user.user_id}/like`,
    {
      method: 'POST',
      credentials: 'include'
    }
  );

  const data = await res.json();

  if (data.match_created) {
    alert('🔥 MATCH!');
  }

  nextCard();
}


function dislike() {
  nextCard();
}
</script>

<style scoped>
.discover-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
}

.loading, .no-users {
  font-size: 1.5rem;
  color: #555;
}

.swipe-card {
  background: white;
  width: 380px;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-photo {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid #e67da8;
}

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

.buttons {
  display: flex;
  gap: 1rem;
}

.buttons button {
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.buttons button:hover {
  transform: scale(1.1);
}
.no-users {
  font-size: 1.5rem;
  color: #555;
  text-align: center;
  padding: 2rem;
  background: #ffe6f0; /* delikatny różowy */
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 350px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.no-users:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

</style>
