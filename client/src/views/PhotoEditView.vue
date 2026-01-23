<template>
  <div class="edit-page">
    <div class="form-box">
      <h1>Edit your photos</h1>
      <p class="desc">You can have up to 3 photos</p>

      <div class="photo-grid">
        <div
          v-for="(photo, index) in combinedPhotos"
          :key="index"
          class="photo-slot"
        >
          <template v-if="photo.url">
            <img
              :src="photo.isExisting ? (SERVER_BASE_URL + photo.url) : photo.url"
              alt="Uploaded"
            />
            
            <button class="remove-icon" @click.stop="handleRemove(index, photo)">
              <span>🗑</span>
            </button>
          </template>

          <div v-else class="empty-slot" @click="uploadPhoto(index)">
            <span>+</span>
          </div>
        </div>
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <button class="finish-btn" @click="saveChanges" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>

      <p class="back">
        <a @click.prevent="$router.push('/profile')" href="#">← Back to profile</a>
      </p>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        style="display: none"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { SERVER_BASE_URL } from "@/config/env";

const store = useUserStore();
const router = useRouter();
const fileInput = ref(null);

const existingPhotos = ref([]);
const deletedFromExisting = ref([]); 
const newFiles = ref([]); 
const isSaving = ref(false);
const errorMsg = ref('');

const extractFilename = (path) => path.split('/').pop();

onMounted(async () => {
  if (!store.user) await store.loadUser();
  existingPhotos.value = [...(store.user?.images_paths || [])];
});

const combinedPhotos = computed(() => {
  const slots = [];
  existingPhotos.value.forEach(path => {
    slots.push({ url: path, isExisting: true });
  });
  newFiles.value.forEach(file => {
    slots.push({ url: URL.createObjectURL(file), isExisting: false });
  });
  while (slots.length < 3) {
    slots.push({ url: null, isExisting: false });
  }
  return slots.slice(0, 3);
});

function uploadPhoto(index) {
  fileInput.value?.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (existingPhotos.value.length + newFiles.value.length >= 3) {
    errorMsg.value = "Max 3 photos allowed.";
    return;
  }
  newFiles.value.push(file);
  errorMsg.value = '';
  event.target.value = '';
}

function handleRemove(index, photo) {
  if (photo.isExisting) {
    const filename = extractFilename(photo.url);
    deletedFromExisting.value.push(filename);
    existingPhotos.value = existingPhotos.value.filter(p => p !== photo.url);
  } else {
    const idxInNew = index - existingPhotos.value.length;
    newFiles.value.splice(idxInNew, 1);
  }
}

async function saveChanges() {
  if (existingPhotos.value.length + newFiles.value.length < 1) {
    errorMsg.value = "At least one photo is required.";
    return;
  }

  isSaving.value = true;
  const formData = new FormData();

  deletedFromExisting.value.forEach(name => formData.append('photos_to_delete', name));
  
  newFiles.value.forEach(file => formData.append('photos', file));

  try {
    const response = await fetch(`${SERVER_BASE_URL}/api/users/${store.user.user_id}`, {
      method: 'PATCH',
      body: formData,
      credentials: 'include'
    });
    
    if (response.ok) {
      await store.loadUser();
      router.push('/profile');
    } else {
      const data = await response.json();
      errorMsg.value = data.error || "Failed to save.";
    }
  } catch (err) {
    errorMsg.value = "Connection error.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.edit-page {
  width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  font-family: 'Poppins', sans-serif;
}

.form-box {
  background: white; padding: 3rem; border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex; flex-direction: column; align-items: center; width: 520px;
}

h1 { color: #a94e74; margin-bottom: 0.5rem; }
.desc { color: #777; font-size: 0.9rem; margin-bottom: 1.5rem; }

.photo-grid {
  display: flex; gap: 2rem; margin-bottom: 2rem;
}

.photo-slot {
  width: 110px; height: 110px;
  background: #f3f3f3; border: 2px dashed #ccc;
  border-radius: 12px; position: relative;
}

.empty-slot {
  width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
  cursor: pointer; font-size: 2rem; color: #cf4e7d; font-weight: bold;
}

.photo-slot img { 
  width: 100%; height: 100%; object-fit: cover; 
  border-radius: 10px;
}

/* Przycisk x w rogu */
.remove-icon {
  position: absolute;
  top: -8px; right: -8px;
  width: 26px; height: 26px;
  background: #cf4e7d; color: white;
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 20;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-size: 0.9rem;
}

.remove-icon:hover {
  background: #a94e74;
}

.finish-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white; border: none; border-radius: 40px;
  padding: 0.8rem 2.5rem; font-weight: 500; cursor: pointer;
}

.error-text { color: #cf4e7d; font-size: 0.8rem; margin-top: 10px; }
.back { margin-top: 1rem; }
.back a { color: #cf4e7d; text-decoration: none; cursor: pointer; }
</style>