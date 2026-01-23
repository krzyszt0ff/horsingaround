<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Wiadomości</h2>
      <input
        v-model="searchQuery"
        placeholder="Szukaj matchy.."
        class="search-input"
      />
    </div>

    <div class="chat-list">
      <div
        v-for="chat in searchOutput"
        :key="chat.match_id"
        class="chat-item"
        :class="{ active: chatStore.activeChat?.match_id === chat.match_id }"
        @click="select(chat)"
      >
        <div class="avatar-wrapper">
          <img
            :src="getImageUrl(chat.other_user.images_paths[0])"
            class="avatar"
            alt="Avatar"
          />
          <span
            v-if="chatStore.onlineUsers.has(chat.other_user.user_id)"
            class="status-dot"
          />
        </div>

        <div class="chat-info">
          <div class="chat-header-row">
            <span class="name">{{ chat.other_user.name }}</span>
            <span class="date">
              {{ formatDate(chat.last_message_date || chat.match_date) }}
            </span>
          </div>

          <p
            class="last-msg"
            :style="{ fontWeight: chat.has_unread ? 'bold' : 'normal' }"
          >
            {{ chat.last_message || 'Nowa para! Napisz coś 👋' }}
          </p>
        </div>

        <div v-if="chat.has_unread" class="unread-dot">🔴</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChatStore, API_URL } from '@/stores/chatStore'

const chatStore = useChatStore()
const searchQuery = ref('')

const emit = defineEmits(['select-chat'])

function select(chat) {
  emit('select-chat', chat)
}

function getImageUrl(path) {
  if (!path) return 'aabcabc'
  return path.startsWith('http') ? path : `${API_URL}${path}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const searchOutput = computed(() => {
  const matches = chatStore.sortedChats || []
  if (!searchQuery.value) return matches

  const input = searchQuery.value.toLowerCase()
  return matches.filter(chat => {
    const name = chat.other_user.name?.toLowerCase() || ''
    const surname = chat.other_user.surnme?.toLowerCase() || ''
    return name.includes(input) || surname.includes(input)
  })
})
</script>

<style scoped>
h2{
    color: #a94e74;
}

.sidebar {
  width: 350px;
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
  background-color: var(--Lpink2);
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
  overflow: hidden;
}

.chat-header-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.name {
  font-weight: 600;
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
  text-overflow: ellipsis;
  margin: 0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}
</style>
