<template>
    <div 
        class="card"
    >
      
      <div class="image-container">
        <div class="photo-bars">
            <div 
                v-for="(img, idx) in user.images_paths" 
                :key="idx"
                class="bar"
                :class="{ active: idx === currentImageIndex }"
            ></div>
        </div>
      <img 
        v-if="user?.images_paths?.length"
        class="profile-photo" 
        :src="SERVER_BASE_URL + user.images_paths[currentImageIndex]" 
        alt="Profile" 
      />
        
        <div class="click-zone left" @click.stop="prevPhoto"></div>
        <div class="click-zone right" @click.stop="nextPhoto"></div>
      </div>

      <div class="bottom-panel">
        
        <div class="panel-header" @click.stop="toggleInfo">
            <div class="header-content">
                <h2>{{ user.name }}, {{ user.age }}</h2>
                <h3>{{ user.distance_km }}km away</h3>
            </div>
            
            <button class="toggle-btn">
                <FontAwesomeIcon :icon="isExpanded ? 'chevron-down' : 'chevron-up'" />
            </button>
        </div>

        <div class="description-wrapper" :class="{ open: isExpanded }">
            <div class="description-inner">
                <p class="desc">{{ user.bio }}</p>
                <div class="report-wrapper">
                  <button title="Report user" @click.stop="showReportModal = true">
                    <FontAwesomeIcon icon="flag" />
                  </button>
                </div>
            </div>
        </div>
      </div>
    <div v-if="showReportModal" class="modal-backdrop">
      <ReportUserModal
        :userId="user.user_id"
        @close="showReportModal = false"
        @success="console.log('report sent')"
      />
    </div>
  </div> 
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SERVER_BASE_URL } from '@/config/env'
import ReportUserModal from '@/components/ReportUserModal.vue';
import { faFlag } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const showReportModal = ref(false);
const user = props.user;

const currentImageIndex = ref(0)
const isExpanded = ref(false)

watch(
  () => props.user,
  () => {
    currentImageIndex.value = 0
    isExpanded.value = false
  }
)

const imageUrl = computed(() =>
  SERVER_BASE_URL +
  props.user.images_paths[currentImageIndex.value]
)

function nextPhoto() {
  if (currentImageIndex.value < props.user.images_paths.length - 1) {
    currentImageIndex.value++
  }
}

function prevPhoto() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function toggleInfo() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.card {
  width: auto;
  height: 85vh;
  aspect-ratio: 2/3;
  background: white;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: absolute;
  display: flex;
  flex-direction: column;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #222;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-bars {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  z-index: 11;
  pointer-events: none;
}
.bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  backdrop-filter: blur(2px);
}
.bar.active { background: white; box-shadow: 0 0 2px rgba(0,0,0,0.5); }
.click-zone {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  z-index: 10;
  cursor: pointer;
}
.click-zone.left { left: 0; }
.click-zone.right { right: 0; }

.bottom-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 20;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.description-wrapper {
  display: grid;
  grid-template-rows: 0fr; 
  transition: grid-template-rows 0.4s ease-out; 
  padding: 0 1.5rem; 
  margin-bottom: 1rem;
}

.description-wrapper.open {
  grid-template-rows: 1fr; 
}

.description-inner {
  overflow: hidden; 
}

.desc {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  
  max-height: 200px; 
  overflow-y: auto;
}

.header-content h2 {
  color: #a94e74;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}


.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  cursor: pointer;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  transition: 0.3s;
}
.toggle-btn:hover { color: #a94e74; }

@media (width <= 650px) {
  .card {
    height: 65vh;
    width: 90vw;
    max-width: 400px;
    margin-bottom: 2rem;
  }
}

.report-wrapper{
  width: 100%;
  display: flex;
  justify-content: end;
}

.report-wrapper button{
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #aaa;
  transition: 0.3s;
  cursor: pointer;
}

.report-wrapper button:hover{
  color: #a94e74;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
h3{
  color: #555;
}
</style>
