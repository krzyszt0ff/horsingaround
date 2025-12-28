<template>
    <div class="bottom-nav">
      <i class="bi bi-house"></i>
      <i class="bi bi-person"></i>
      <i class="bi bi-chat"></i>
    </div>
</template>

<script setup>

</script>

<style scoped>
    .bottom-nav {
    margin-top: auto;
    padding: 1rem;
    width: 100%;
    display: none;
    position: fixed;
    bottom: 0;
    justify-content: space-around;
    border-top: 1px solid #ddd;
    background: white;
    font-size: 1.6rem;
    color: #a94e74;
    }

    @media (width <= 650px) {
        .bottom-nav{
            display: flex;
        }
    }
</style>