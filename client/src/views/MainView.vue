<template>
  <main class="main-page" ref="mainPage" :style="swipeBg">
    <div v-if="loading" class="loading">
      <h2>Ładowanie...</h2>
    </div>

    <div v-else-if="users.length === 0" class="no-users">
      Brak nowych użytkowników do pokazania 
    </div>

    <div v-if="!endOfUsers" class="card-stack">
      <ProfileCard
        v-for="(user, index) in visibleCards"
        :key="currentIndex + index"
        :user="user"
        ref="profileCard"
        :style="[swipeTransform, depthTransform(index), cardStyle(index)]"
        @pointerdown="isHolding=true, pointerCoordinates=percent"
      />
    </div>

    <div v-if="!endOfUsers && users.length!==0" class="panel-buttons">
      <button class="dislike" @click.stop="dislike">
        <FontAwesomeIcon icon="x" class="icon"/>
      </button>
      <button class="like" @click.stop="like">
        <FontAwesomeIcon icon="heart" class="icon"/>
      </button>
    </div>

    <div v-if="endOfUsers" class="no-users">
       To już wszyscy użytkownicy w Twojej okolicy.
    </div>
  </main>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import ProfileCard from '@/components/ProfileCard.vue';
import { useTemplateRef } from 'vue';
import { useElementSize, useMouseInElement } from '@vueuse/core';
import { useClamp, useProjection } from '@vueuse/math';
import { SERVER_BASE_URL } from "@/config/env";
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { sessionFilters } from '@/stores/filters';   

const store = useUserStore();
const users = ref([]);
const loading = ref(true);
const currentIndex = ref(0);
const endOfUsers = ref(false);

const visibleCards = computed(() =>
  users.value.slice(currentIndex.value, currentIndex.value + 3)
)

const currentImageIndex = ref(0);
const isExpanded = ref(false);

const mainPage = useTemplateRef("mainPage")

const pointerCoordinates = ref(0)
const isHolding = ref(false)

const { elementX: x } = useMouseInElement(mainPage)
const { width } = useElementSize(mainPage)
const percent = computed(()=>x.value/width.value)
const pointerMovement = computed(()=>percent.value-pointerCoordinates.value)

const rotation = useProjection(useClamp(pointerMovement, -1, 1),[-1,1],[-90,90])

const swipeTransform = computed(() => {
  if (!isHolding.value) return ''
  return `rotate(${rotation.value}deg)`
})

const depthTransform = (index) =>
  `scale(${1 - index * 0.05}) translateY(${index * 12}px)`

const cardStyle = (index) => ({
  transform: `
    ${depthTransform(index)}
    ${index === 0 ? swipeTransform.value : ''}
  `,
  transformOrigin: 'bottom center',
  transition: isHolding.value
    ? 'none'
    : 'transform 0.25s ease-out',
  zIndex: 10 - index
})

const swipeBg = computed(()=>{
  if (!isHolding.value) return {}
  const r = rotation.value
  return{
    background:
    r > 0
      ? `linear-gradient(to left, #6fcf97, transparent ${r}%)`
      : `linear-gradient(to right, #ff7b7b, transparent ${-r}%)`
  }
})

let touchStartX = 0;

function handleTouchStart(e) {
  isHolding.value = true;
  touchStartX = e.touches[0].clientX;
  pointerCoordinates.value = touchStartX / width.value;
}

function handleTouchMove(e) {
  const touchX = e.touches[0].clientX;
  const percentMove = touchX / width.value;
  pointerMovement.value = percentMove - pointerCoordinates.value;
}

function handleTouchEnd() {
  swipe();
}

const fetchUsers = async () => {
  loading.value = true;
  try {
    let url = `${SERVER_BASE_URL}/api/users?page=1`;
    
    if (sessionFilters.isActive) {
      if (sessionFilters.gender !== 'all') {
        url += `&gender=${sessionFilters.gender}`;
      }
      url += `&minAge=${sessionFilters.ageRange[0]}`;
      url += `&maxAge=${sessionFilters.ageRange[1]}`;
      url += `&distance=${sessionFilters.distance}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });
    const data = await res.json();
    
    if (data.success) {
      users.value = data.data.filter(u => u.user_id !== store.user.userId);
      currentIndex.value = 0; 
      endOfUsers.value = users.value.length === 0;
    }
  } catch (err) {
    console.error('Błąd pobierania użytkowników:', err);
  } finally {
    loading.value = false;
  }
};

watch(sessionFilters, () => {
  fetchUsers();
}, { deep: true });

onMounted(async () => {
  await fetchUsers();
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/users?page=1`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });
    const data = await res.json();
    if (data.success) {
      users.value = data.data.filter(u => u.user_id !== store.user.userId);
    }
  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    loading.value = false;
  }

  window.addEventListener('pointerup', swipe)
  window.addEventListener('pointercancel', swipe)

  mainPage.value.addEventListener('touchstart', handleTouchStart);
  mainPage.value.addEventListener('touchmove', handleTouchMove);
  mainPage.value.addEventListener('touchend', handleTouchEnd);
  mainPage.value.addEventListener('touchcancel', handleTouchEnd);
});

function nextCard() {
  if (currentIndex.value < users.value.length - 1) {
    currentIndex.value++;
    currentImageIndex.value = 0; 
    isExpanded.value = false; 
  } else {
    endOfUsers.value = true;
  }
}

async function like() {
  const user = users.value[currentIndex.value];
  const res = await fetch(`${SERVER_BASE_URL}/api/users/${user.user_id}/like`, {
      method: 'POST', credentials: 'include'
  });
  const data = await res.json();
  if (data.match_created) alert('🔥 MATCH!');
  nextCard();
}

function dislike() {
  nextCard();
}


function swipe() {
  if(isHolding.value===true){
    isHolding.value=false
    if(rotation.value > 20){
      like()
    }
    else if(rotation.value < -20){
      dislike()
    }
    else{
      return
    }
  }
}

</script>

<style scoped>
  h2{
    color: black;
      user-select: none;
  }

.main-page{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  touch-action: pan-y;
  touch-action: pan-x;
  user-select: none;
}

.panel-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0 1.5rem 0;
  z-index: 99;
}

.dislike, .like {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  font-size: 1.6rem;
  border: 3px solid;
  background: white;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dislike { border-color: #ff7b7b; color: #ff7b7b; }
.like { border-color: #6fcf97; color: #6fcf97; }
.dislike:hover { background: #ff7b7b; color: white; transform: scale(1.1); }
.like:hover { background: #6fcf97; color: white; transform: scale(1.1); }

.no-users {
  font-size: 1.2rem;
  color: #a94e74;
  text-align: center;
  padding: 2rem;
  background: #ffe6f0;
  border-radius: 16px;
  max-width: 350px;
  margin: 0 auto;
}

.card-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (width <= 650px) {
  .card-stack{
    padding-top: 4rem;
  }
}
</style>