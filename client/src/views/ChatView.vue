<template>
  <div class="chat-layout">

    <ChatSidebar
      v-show="isDesktop || mobileView === 'list'"
      class="chat-sidebar"
      @select-chat="handleSelectChat"
    />
    <div class="chat-window"       
    v-show="isDesktop || mobileView === 'chat'">
      <ChatWindow 
      class="chat-window" 
      v-if="chatStore.activeChat"
      @back="mobileView = 'list'" />
      <div v-else class="placeholder">
        <p>Wybierz konwersację po lewej stronie</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'

import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'

const chatStore = useChatStore()

const mobileView = ref('list')

const isDesktop = ref(window.innerWidth > 900)

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
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #fff;
  font-family: 'Segoe UI', sans-serif;
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
</style>
