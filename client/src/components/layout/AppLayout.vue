<template>
    <div class="app-layout">
        <AppHeader />
        <AppSidebar />
        <AppNavbar />
        <main class="content">
            <slot></slot>
        </main>
    </div>
</template>

<script setup>
    import AppHeader from '../AppHeader.vue';
    import AppNavbar from '../AppNavbar.vue';
    import AppSidebar from '../AppSidebar.vue';
</script>

<style scoped>
    .app-layout{
        width: 100%;
        min-height: 100%;
        display: grid;
        grid-template-columns: 300px 1fr;
        background: var(--bg-gradient);
        max-height: 100vh;
        overflow-y: auto;
    }
    .content {
        width: 100%;
        height: 100%;
        grid-column: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Poppins', sans-serif;
    }

    /*
    @media (width <= 650px) {
        .app-layout{
            display: flex;
            align-items: center;
            justify-items: center;
        }
    }*/

    @media (width <= 650px) {
        .app-layout{
            grid-template-columns: 1fr;
            grid-template-rows: 4rem 1fr 5.5rem;
        }
        .content{
            grid-column: 1;
            grid-row: 2;
        }
    }
</style>