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
      <img class="profile-photo" :src="'http://localhost:3000' + user.images_paths[0]" alt="Profile" />
      <div class="user-info">
        <h2>{{ user.name }}, {{ user.age }}</h2>
        <p class="desc">"{{ user.description }}"</p>
      </div>

      <div class="buttons">
        <button class="dislike" @click="dislike">
          <FontAwesomeIcon icon="x" class="icon"/>
        </button>
        <button class="like" @click="like">
          <FontAwesomeIcon icon="heart" class="icon"/>
        </button>
      </div>
    </div>

    <!-- Komunikat "koniec użytkowników" -->
    <div v-if="endOfUsers" class="no-users">
       To już wszyscy użytkownicy w Twojej okolicy, galopuj dalej
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
/* 🔹 Główna karta */
.card {
  width: 320px;
  height: 460px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-photo {
  width: 100%;
  height: 70%;
  object-fit: cover;
}

.user-info {
  padding: 1rem;
  text-align: center;
}

.user-info h2 {
  color: #a94e74;
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.user-info .desc {
  color: #555;
  font-size: 0.9rem;
}

/* 🔹 Przyciski */
.buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1.5rem 0;
}

.dislike,
.like {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 1.8rem;
  border: 3px solid;
  background: white;
  cursor: pointer;
  transition: 0.3s;
}

.dislike {
  border-color: #ff7b7b;
  color: #ff7b7b;
}

.like {
  border-color: #6fcf97;
  color: #6fcf97;
}

.dislike:hover {
  background: #ff7b7b;
  color: white;
}

.like:hover {
  background: #6fcf97;
  color: white;
}

  @media (width <= 650px) {
    .card{
      position: relative;
      height: 60vh;
      width: 80vw;
      max-width: 400px;
      max-height: 600px;
      margin-bottom: 7rem;
    }
    .buttons{
      z-index: 99;
      position: absolute;
      left: 50%;
      transform: translate(-50%, 50%);
      bottom: 9rem;
      display: flex;
      gap: 1rem;
    }
    .like, .dislike{
      width: 80px;
      height: 80px;
    }
  }

  .like > .icon{
    margin-top: 0.4rem;
  }
  .dislike > .icon{
    margin-top: 0.3rem;
  }

  .loading, .no-users {
  font-size: 1.5rem;
  color: #555;
  }

  .no-users {
  font-size: 1.5rem;
  color: var(--pink3);
  text-align: center;
  padding: 2rem;
  background: var(--Lpink);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 350px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.no-users:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}
</style>
