<template>
  <div class="chat-container">
    <header class="window-header">
       <div class="user-details" v-if="activeChat">
        <button class="back-btn" @click="$emit('back')">
          <FontAwesomeIcon icon="chevron-left" class="icon"/>
        </button>
         <img 
           :src="getImageUrl(activeChat.other_user.images_paths[0])" 
           class="header-avatar" 
         />
         <div class="active-chat-info">
           <h3>{{ activeChat.other_user.name }}</h3>
           <span v-if="isOnline" class="status-active">Online</span>
           <span v-else class="status-inactive">Offline</span>
         </div>
       </div>
    </header>
  
    <div class="messages-area" ref="messagesContainer">
      <ChatMessage
        v-for="(msg, index) in messages"
        :key="msg._id"
        :message="msg"
        :is-mine="String(msg.from_user?._id || msg.from_user) === String(store.myUserId)"
        :is-clicked="activeMessageId === msg._id"
        :show-date-separator="isNewDay(msg, messages[index - 1])"
        :formatted-date="formatFullDate(msg.created_at)"
        @toggle-timestamp="toggleTimestamp(msg._id)"
      />
    </div>

    <div class="input-area">
      <input 
        v-model="newMessage"
        @keyup.enter="handleSend"
        placeholder="Napisz wiadomość..." 
      />
      <button @click="handleSend" :disabled="!newMessage.trim()">Send</button>
    </div>
  </div>
</template>

<script setup>

  import { ref, computed, nextTick, watch } from 'vue';
  import { useChatStore, API_URL } from '@/stores/chatStore';
  import ChatMessage from './ChatMessage.vue';

  const store = useChatStore();         // Połączenie ze storem

  const newMessage = ref('');           // Zmienna reaktywna do inputu
  const messagesContainer = ref(null);  // Zmienna reaktywna - uchwyt do diva z wiadomoścami
  const activeMessageId = ref(null);    // Zmienna reaktywna - przechowuje klikniętą wiadomość

  // Dane obliczeniowe (zmieniające się)
  const activeChat = computed(() => store.activeChat);  // Aktualnie otwarta rozmowa
  const messages = computed(() => store.messages);      // Lista wiadomości pobrana ze store
  const isOnline = computed(() => store.onlineUsers.has(activeChat.value?.other_user?.user_id));  // Flag aktywności naszego wybranego rozmówcy

  function getImageUrl(path) {
    if (!path) return 'https://media.os.fressnapf.com/cms/2022/09/trakehner_portrait.jpg?t=seoimg_703';
    return path.startsWith('http') ? path : `${API_URL}${path}`;
  }

  const scrollToBottom = () => {
    nextTick(() => {  // Zaczekaj z przewijaniem do nastnego ticku (żeby wiadomość najpier dodała się do listy (1 tick) i dodała się do dokumentu (2 tick))
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; // Ustawienie scrolla na sam dół
      }
    });
  };

  const toggleTimestamp = (id) => { // Przełącznik wybierania wiadomości
    activeMessageId.value = activeMessageId.value === id ? null : id;
  };

  const formatFullDate = (date) => { // Sprawdzanie i formatowanie daty
    const d = new Date(date);
    const today = new Date().toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate()-1);

    if (d.toDateString() === today) return 'Today';
    if (d.toDateString() === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  const isNewDay = (currentMsg, prevMsg) => { // Porównywanie dat dwóch wiadomości
    if (!prevMsg) return true;
    const current = new Date(currentMsg.created_at).toDateString();
    const prev = new Date(prevMsg.created_at).toDateString();
    return current !== prev;
  };

  watch(messages, () => { // Obserwuje zmiany w wiadomościach (dodanie nowej)
    scrollToBottom();     // Natychmist przewija do dołu
  }, { deep: true, immediate: true });

  function handleSend() {
    if (!newMessage.value.trim()) return;
    store.sendMessage(newMessage.value);  // Wysyła treść wiadomości do store
    newMessage.value = '';                // Czyści input i zmienną
  }

  defineEmits(['back'])
</script>

<style scoped>
  .chat-container { 
    display: flex; 
    flex-direction: column; 
    height: 100%; 
    max-height: 100vh;
    background: #fff; 
  }

  .window-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    position: static;
    top: 0;
  }

  .user-details {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .status-active {
    font-size: 0.8rem;
    color: #2cc069;
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #fdfdfd;
    display: flex;
    flex-direction: column;
  }

  .input-area {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    position: static;
    bottom: 0;
  }

  .input-area input {
    flex: 1;
    padding: 12px 15px;
    border-radius: 20px;
    border: 1px solid #ddd;
    outline: none;
    background: #f0f2f5;
    margin-bottom: 0;
  }

  .input-area button {
    padding: 10px 20px;
    background: var(--pink4);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
  }

  .input-area button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .active-chat-info{
    color: #666;
  }

  .back-btn{
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: gray;
  }

  @media (width <= 900px) {
  .back-btn {
    display: block;
  }
  }
  @media (width <= 650px) {
  .chat-container{
    max-height: calc(100vh - 9.5rem);
  }
  }
</style>