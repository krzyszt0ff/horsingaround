<template>
    <div class="bottom-nav">
<button
          class="navbar-btn"
          :class="{ active: route.path === '/app' }"
          :disabled="route.path === '/app'"
          @click="goTo('/')"
        >
        <FontAwesomeIcon icon="heart" class="icon"/>
        </button>
        <button
          class="navbar-btn"
          :class="{ active: route.path === '/ranking' }"
          :disabled="route.path === '/ranking'"
          @click="goTo('/ranking')"
        >
        <FontAwesomeIcon icon="award" class="icon"/>
        </button>
        <button
          class="navbar-btn"
          :class="{ active: route.path === '/chat' }"
          :disabled="route.path === '/chat'"
          @click="goTo('/chat')"
        >
        <FontAwesomeIcon icon="message" class="icon"/>
        </button>
        <button
          class="navbar-btn"
          :class="{ active: route.path === '/profile' }"
          :disabled="route.path === '/profile'"
          @click="goTo('/profile')"
        >
        <FontAwesomeIcon icon="user" class="icon"/>
        </button>
    </div>
</template>

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

<style scoped>
    .bottom-nav {
    grid-row: 3;
    margin-top: auto;
    padding: 1rem 1rem 2rem 1rem;
    position: fixed;
    bottom: 0;
    width: 100%;
    display: none;
    justify-content: space-around;
    border-top: 1px solid #ddd;
    background: white;
    color: #a94e74;
    z-index: 999;
    }

    @media (width <= 650px) {
        .bottom-nav{
            display: flex;
        }
    }

    .navbar-btn{
        background: none;
        border: none;
        font-size: 2rem;
        color: gray;
    }
    .navbar-btn.active{
        color: var(--pink3);
        transition: 0.2s;
    }
</style>