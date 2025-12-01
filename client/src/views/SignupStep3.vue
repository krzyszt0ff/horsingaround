<template>
  <div class="signup-page">
    <div class="form-box">
      <h1>Upload your photos</h1>
      <p class="desc">Add at least one photo to complete your profile</p>

      <!--TODO: FIX THE PHOTO GRID-->
      <div class="photo-grid">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="photo-slot"
          @click="uploadPhoto(index)"
        >
          <img v-if="photoPreviews[index]" :src="photoPreviews[index]" alt="Uploaded"/>
          <span v-else>+</span>
        </div>
      </div>

      <button class="finish-btn" @click="handleFinish">Finish</button>

      <p class="back">
        <a @click.prevent="$router.push('/signup/step2')" href="#">← Back</a>
      </p>

      <!-- Ukryte pole pliku -->
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRegistrationStore } from '@/stores/registration';

//=============
//OBSŁUGA ZDJĘĆ
//=============

const photos = ref([null, null, null])
const photoPreviews = ref([null, null, null])
const activeIndex = ref(0)
const fileInput = ref(null)

function uploadPhoto(index) {
  activeIndex.value = index
  fileInput.value.click()
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  photos.value[activeIndex.value] = file

  photoPreviews.value[activeIndex.value] = URL.createObjectURL(file)
}

//===================
//OBSŁUGA REJESTRACJI
//===================

const store = useRegistrationStore()
const router = useRouter()
let storeAll = ref('')

async function handleFinish() {
  store.updateStep('step3', {
      photos: photos.value
  })

  let credentialData;
  storeAll = store.allData
  const default_distance = 60;

  try{
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: storeAll.email,
        password: storeAll.password,
      }),
    });

    credentialData = await response.json();
    console.log(credentialData);
  } catch (error) {
    console.log(error);
  }

  
  if(credentialData.success){
    try{
      const userData = new FormData();
      userData.append("name", storeAll.name);
      userData.append("date_of_birth", storeAll.dateOfBirth);
      userData.append("gender", storeAll.gender);
      storeAll.preferred_gender.forEach(gender => {
        userData.append("preferred_gender", gender);
      });
      userData.append("preferred_min_age", Number(storeAll.age_preference[0].value));
      userData.append("preferred_max_age", Number(storeAll.age_preference[1].value));
      userData.append("preferred_distance", default_distance);
      storeAll.photos.forEach(photo => {
        if (photo) userData.append("photos", photo);
      });
      userData.append("longitude", 0);
      userData.append("latitude", 0);

      const response = await fetch("http://localhost:3000/api/users/", {
        method: "POST",
        credentials: "include",
        body: userData,
        
      });
      if (!response.ok) {
        const text = await response.text();
        console.log("BACKEND ERROR:", text);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      router.push('/profile')
    } catch (error) {
      console.log(error);
    }
  }

  console.log(storeAll)
}
</script>

<style scoped>
.signup-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  font-family: 'Poppins', sans-serif;
}

.form-box {
  background: white;
  padding: 3rem 4rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
}

h1 {
  color: #a94e74;
  margin-bottom: 0.5rem;
}

.desc {
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.photo-grid {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.photo-slot {
  width: 100px;
  height: 100px;
  background: #f3f3f3;
  border: 2px dashed #ccc;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: 0.3s;
}

.photo-slot:hover {
  border-color: #cf4e7d;
  transform: scale(1.05);
}

.photo-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-slot span {
  font-size: 2rem;
  color: #cf4e7d;
  font-weight: bold;
}

.finish-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white;
  border: none;
  border-radius: 40px;
  padding: 0.8rem 2.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
}

.finish-btn:hover {
  transform: scale(1.05);
}

.back {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.back a {
  color: #cf4e7d;
  text-decoration: none;
}
</style>
