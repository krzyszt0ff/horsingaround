<template>
    <header class="top-bar">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <button class="settings-btn">
        <FontAwesomeIcon icon="sliders" class="icon" />
      </button>
    </header>
</template>

<style scoped>
    .logo {
    width: 4rem;
    height: 4rem;
    }

    .top-bar {
    width: 100%;
    z-index: 99;
    padding: 1.5rem;
    top: 0;
    position: fixed;
    display: none;
    justify-content: space-between;
    align-items: center;
    }

    .settings-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: gray;
    font-size: 2.5rem;
    cursor: pointer;
    }

    @media (width <= 650px) {
        .top-bar{
            display: flex;
        }
    }
</style>

<script setup>
    
</script>