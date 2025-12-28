<template>
  <main class="main-page">
    <div class="card">
      <img :src="currentUser.photo" alt="User" class="profile-photo" />
      <div class="user-info">
        <h2>{{ currentUser.name }}, {{ currentUser.age }}</h2>
        <p class="desc">"{{ currentUser.description }}"</p>
      </div>
    </div>

    <div class="buttons">
      <button class="dislike" @click="nextUser">❌</button>
      <button class="like" @click="nextUser">💚</button>
    </div>
  </main>
</template>

<script>
export default {
  name: 'MainView',
  data() {
    return {
      currentIndex: 0,
      users: [
        {
          name: 'Agnieszka',
          age: 23,
          photo: '@/assets/default-profile.jpg',
          description: 'Nie porównuj ludzi do koni. Ludzie będą łamać ci serce non stop, a koń zrobi to tylko raz...'
        },
        {
          name: 'Zuzanna',
          age: 25,
          photo: 'https://placekitten.com/300/300',
          description: 'Uwielbiam stajnię o poranku 🐴💨'
        },
        {
          name: 'Klaudia',
          age: 21,
          photo: 'https://placekitten.com/301/301',
          description: 'Jeżdżę od dziecka. Szukam kogoś, kto zrozumie zapach siodła 😄'
        }
      ]
    }
  },
  computed: {
    currentUser() {
      return this.users[this.currentIndex]
    }
  },
  methods: {
    nextUser() {
      this.currentIndex = (this.currentIndex + 1) % this.users.length
    }
  }
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
</style>
