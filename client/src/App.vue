<template>
  <component :is="layout">
      <RouterView />
  </component>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, watch } from 'vue';
  import axios from 'axios';
  import { useRoute } from 'vue-router';
  import { publicRoutes } from './router/index'
  import { useUserStore } from '@/stores/user';
  import { useChatStore } from '@/stores/chatStore';
  import AppLayout from './components/layout/AppLayout.vue';

  const route = useRoute()
  const userStore = useUserStore();
  const chatStore = useChatStore();

  const API_URL = 'http://localhost:3000';

  const UPDATE_INTERVAL = 30000 // to 5 minut w ms
  let locationUpdateInterval = null;

  const layout = computed(() => {
    const path = route.path
    if (publicRoutes.includes(path)) {
      return 'div'
    }
    return AppLayout
  });

  const startTracking = () => {
    if (locationUpdateInterval) clearInterval(locationUpdateInterval);

    checkAndSendLocation();

    locationUpdateInterval = setInterval(() => {
      checkAndSendLocation();
    }, UPDATE_INTERVAL);
  };

  const stopTracking = () => {
    if(locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
    }
  };

  const sendLocationUpdate = async (lat, lng) => {
    if (!userStore.user) return;

    try {
        await axios.patch(`${API_URL}/api/users/location`, 
          {
            latitude: lat,
            longitude: lng
          },
          { withCredentials: true } 
        );
    } catch (err) {
      console.error("Failed to update location:", err);
    }
  }

  const checkAndSendLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendLocationUpdate(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  watch(
    () => userStore.user,
    (newUser) => {
      const isPublic = publicRoutes.includes(route.path);
      if (newUser && !isPublic) {
        startTracking();
        const id = newUser.user_id;
        if (id) {
          chatStore.initSocket(id);
        }
      } else stopTracking();
    },
    { immediate: true, deep: true }
  );

  onMounted(async () => {
    checkAndSendLocation();
    if (!userStore.user) await userStore.loadUser();    
  });

  onUnmounted(() => {
    stopTracking();
  });

</script>

<style>
  @import './assets/variables.css';

  html, body, #app {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
</style>
