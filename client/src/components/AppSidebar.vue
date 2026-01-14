<template>
    <aside class="sidebar">
      <div class="sidebar-content">
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>
        <button
          class="sidebar-btn"
          :class="{ active: route.path === '/app' }"
          :disabled="route.path === '/app'"
          @click="goTo('/')"
        >
        <FontAwesomeIcon icon="heart" class="icon"/>
          Swipe
        </button>
        <button
          class="sidebar-btn"
          :class="{ active: route.path === '/ranking' }"
          :disabled="route.path === '/ranking'"
          @click="goTo('/ranking')"
        >
        <FontAwesomeIcon icon="award" class="icon"/>
          Ranking
        </button>
        <button
          class="sidebar-btn"
          :class="{ active: route.path === '/chat' }"
          :disabled="route.path === '/chat'"
          @click="goTo('/chat')"
        >
        <FontAwesomeIcon icon="message" class="icon"/>
          Chat
        </button>
        <button
          class="sidebar-btn"
          :class="{ active: route.path === '/profile' }"
          :disabled="route.path === '/profile'"
          @click="goTo('/profile')"
        >
        <FontAwesomeIcon icon="user" class="icon"/>
          Profile
        </button>
      </div>
      <button class="sidebar-btn">
        <FontAwesomeIcon icon="sliders" class="icon" />
        Preferences
      </button>
    </aside>
</template>

<style scoped>
    .logo {
    width: 3rem;
    height: 3rem;
    }
    .logo-container{
      margin: 1rem 0 0 1.5rem;
    }

    .sidebar {
    grid-column: 1;
    background: linear-gradient(to bottom, var(--pink2), var(--pink3));
    box-shadow: 3px 0px 3px rgb(0 0 0 / 20%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    }

    .sidebar-content{
    display: flex;
    flex-direction: column;
    }

    @media (width <= 650px) {
        .sidebar{
            display: none;
        }
    }

    .sidebar-btn{
      font-family: 'Kreon', serif;
      font-weight: 400;
      height: 4rem;
      font-size: 2rem;
      background: none;
      border: none;
      cursor: pointer;
      padding-left: 1.5rem;
      color: var(--Lpink);
      display: flex;
      align-items: start;
      align-items: center;
    }
    .sidebar-btn:hover{
      background: rgba(255, 255, 255, 0.2);
      transition: 0.5s;
    }
    .sidebar-btn.active{
      background: var(--pink3);
      cursor: default;
    }
    .icon{
      font-size: 2rem;
      margin-right: 1rem;
      color: var(--Lpink);
    }
</style>

<script setup>
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute()
  const router = useRouter()

  const goTo = (path) => {
    if (route.path !== path) {
      router.push(path)
    }
  }
</script>