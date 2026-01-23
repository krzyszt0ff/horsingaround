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
    width: 2.5rem;
    height: 2.5rem;
    }

    .top-bar {
    grid-row: 1;
    width: 100%;
    z-index: 99;
    padding: 0.7rem;
    top: 0;
    position: fixed;
    display: none;
    justify-content: space-between;
    align-items: center;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .settings-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: gray;
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