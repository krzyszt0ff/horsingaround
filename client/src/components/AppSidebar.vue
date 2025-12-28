<template>
    <aside class="sidebar">
      <div class="sidebar-content">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <button @click="$router.push('/')">
          Swipe
        </button>
        <button>
          Ranking
        </button>
        <button @click="$router.push('/chat')">
          Chat
        </button>
        <button @click="$router.push('/profile')">
          Profile
        </button>
      </div>
    </aside>
</template>

<style scoped>
    .logo {
    width: 50px;
    height: 50px;
    }

    .sidebar {
    grid-column: 1;
    background: linear-gradient(to bottom, var(--pink2), var(--pink3));
    }

    .sidebar-content{
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    }

    @media (width <= 650px) {
        .sidebar{
            display: none;
        }
    }
</style>

<script setup>

</script>