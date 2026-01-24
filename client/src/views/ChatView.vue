<template>
  <div class="chat-layout">

    <ChatSidebar
      v-show="isDesktop || mobileView === 'list'"
      class="chat-sidebar"
      @select-chat="handleSelectChat"
      @open-user-profile="openUserProfile"
    />
      <div class="chat-window" v-show="isDesktop || mobileView === 'chat'">
      <ChatWindow 
        v-if="chatStore.activeChat"
        class="chat-window" 
        @back="mobileView = 'list'"
        @open-profile="openUserProfile" 
      />
      <div v-else class="placeholder">
        <p>Wybierz konwersację po lewej stronie</p>
      </div>
    </div>
      <Transition name="fade">
        <div v-if="isProfileOpen" class="profile-modal-overlay">
          <div class="modal-backdrop" @click="closeProfile"></div>
          <div class="profile-modal-content">
            <ProfileCard 
              v-if="selectedUserForPreview" 
              :user="selectedUserForPreview" 
            />
          </div>
        </div>
      </Transition>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { SERVER_BASE_URL } from "@/config/env"

import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ProfileCard from '@/components/ProfileCard.vue'

const chatStore = useChatStore()

const mobileView = ref('list')

const isDesktop = ref(window.innerWidth > 900)

const isProfileOpen = ref(false)
const selectedUserForPreview = ref(null)

onMounted(async () => {
  await chatStore.fetchChats()
  window.addEventListener('resize', onResize)
})

function onResize() {
  isDesktop.value = window.innerWidth > 900
}

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chatStore.activeChat = null
})

function handleSelectChat(chat) {
  chatStore.selectChat(chat)
  if (!isDesktop.value) {
    mobileView.value = 'chat'
  }
}
async function openUserProfile(userId = null) {
  const targetId = userId || chatStore.activeChat?.other_user?.user_id || chatStore.activeChat?.other_user?._id;
  
  if (!targetId) return;

  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/users/${targetId}`, {
      credentials: 'include'
    });
    const json = await res.json();
    
    if (json.success) {
      selectedUserForPreview.value = {
        ...json.data.user,
        age: json.data.age,
        distance_km: json.data.distance_km
      };
      isProfileOpen.value = true;
    }
  } catch (err) {
    console.error("Błąd pobierania profilu:", err);
  }
}

function closeProfile() {
  isProfileOpen.value = false
  selectedUserForPreview.value = null
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #fff;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-size: 1.2rem;
}

@media (max-width: 900px) {
  .chat-layout {
    flex-direction: column;
  }

  .chat-sidebar,
  .chat-window {
    width: 100%;
    height: 100%;
  }
}
.profile-modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}

.modal-backdrop {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: -1;
}

.profile-modal-content {
  position: relative;
  z-index: 10000;
  pointer-events: auto;
}

:deep(.card) {
  position: relative !important;
  top: unset !important;
  left: unset !important;
  margin: 0 auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@media (max-width: 900px) {
  .chat-card {
    width: 100%;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
  
  .chat-sidebar {
    width: 100%;
  }
}
</style>
