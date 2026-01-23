<template>
  <div class="chat-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Wiadomości</h2>
        <input
          v-model="searchQuery"
          placeholder="Szukaj matchy.."
          class="search-input" />
      </div>

      <div class="chat-list">
        <div 
          v-for="chat in searchOutput" 
          :key="chat.match_id"
          class="chat-item"
          :class="{ active: chatStore.activeChat?.match_id === chat.match_id }"
          @click="chatStore.selectChat(chat)"
        >
          <div class="avatar-wrapper">
             <img 
               :src="getImageUrl(chat.other_user.images_paths[0])" 
               class="avatar" 
               alt="Avatar"
             />
             <span v-if="chatStore.onlineUsers.has(chat.other_user.user_id)" class="status-dot"></span>
          </div>
          
          <div class="chat-info">
            <div class="chat-header-row">
               <span class="name">{{ chat.other_user.name }}</span>
               <span class="date">{{ formatDate(chat.last_message_date || chat.match_date) }}</span>
            </div>
            <p :style="{ fontWeight: chat.has_unread ? 'bold' : 'normal' }" class="last-msg">
              {{ chat.last_message || 'Nowa para! Napisz coś 👋' }}
            </p>
          </div>
          <div v-if="chat.has_unread" class="unread-dot">🔴</div>
        </div>
      </div>
    </aside>

    <main class="main-window">
      <ChatWindow v-if="chatStore.activeChat" />
      <div v-else class="placeholder">
        <p>Wybierz konwersację po lewej stronie</p>
      </div>
    </main>
  </div>
</template>

<script setup>

  import { ref, computed, onMounted, onUnmounted} from 'vue';
  import { useChatStore, API_URL } from '@/stores/chatStore';
  import ChatWindow from '@/components/chat/ChatWindow.vue';
  import { useUserStore } from '@/stores/user'; 

  const chatStore = useChatStore();
  const userStore = useUserStore();
  const userID = userStore.user.user_id;

  const searchQuery = ref('');

  onMounted(async () => {
    await chatStore.fetchChats(); // Pobranie chatów
  }); // Init socketów został przeniesiony do App.vue, żeby wykonywał się raz a nie przy każdym renderze tego momponentu :-p

  function getImageUrl(path) { // To jest do poprawy
    if (!path) return 'aabcabc';
    return path.startsWith('http') ? path : `${API_URL}${path}`;
  }

  function formatDate(dateStr) { // Formtowanie daty do postaci hh:mm
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const searchOutput = computed(() => {
    const matches = chatStore.sortedChats || [];
    if (!searchQuery.value) return matches;

    const input = searchQuery.value.toLowerCase();
    return matches.filter(chat => {
      const name = chat.other_user.name?.toLowerCase() || '';
      const surname = chat.other_user.surnme?.toLowerCase() || '';
      
      return name.includes(input) || surname.includes(input);
    });
  });

</script>

<style scoped>
  h1, h2, h3, h4, h5{
    color: #666;
  }

  .chat-layout {
    display: flex;
    width: 1fr;
    height: 100%;
    width: 100%;
    background-color: #fff;
    font-family: 'Segoe UI', sans-serif;
  }

  .sidebar {
    width: 350px; /* Sztywna szerokość listy */
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .chat-list {
    overflow-y: auto;
    flex: 1;
  }

  .chat-item {
    display: flex;
    padding: 15px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f9f9f9;
  }

  .chat-item:hover {
    background-color: var(--Lpink);
  }

  .chat-item.active {
    background-color: var(--Lpink2); /* Wyróżnienie aktywnego */
    border-right: 3px solid var(--pink3);
  }

  .avatar-wrapper {
    position: relative;
    margin-right: 15px;
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    background-color: #2cc069;
    border: 2px solid white;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .chat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden; /* Ważne dla ucinania tekstu */
  }

  .chat-header-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .name {
    font-weight: 600;
    font-size: 1rem;
    color: #666;
  }

  .date {
    font-size: 0.75rem;
    color: #999;
  }

  .last-msg {
    font-size: 0.9rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* ... jak tekst za długi */
    margin: 0;
  }

  .main-window {
    flex: 1; /* Reszta szerokości */
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

  .search-input {
    width: 100%;
    padding: 8px 12px;
    margin-top: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
  }

  .search-input:focus {
    border-color: #007bff;
  }
</style>