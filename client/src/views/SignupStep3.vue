<template>
  <div class="signup-page">
    <div class="form-box">
      <h1>Upload your photos</h1>
      <p class="desc">Add at least one photo to complete your profile</p>

      <div class="photo-grid">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="photo-slot"
          @click="uploadPhoto(index)"
        >
          <img
            v-if="photoPreviews[index]"
            :src="photoPreviews[index]"
            alt="Uploaded"
          />
          <span v-else>+</span>
        </div>
      </div>

      <!-- błąd walidacji zdjęć -->
      <p v-if="photoError" class="error-text">{{ photoError }}</p>

      <!-- ogólny błąd backendu / rejestracji -->
      <p v-if="errorMessage" class="error-text backend-error">
        {{ errorMessage }}
      </p>

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
import { SERVER_BASE_URL } from "@/config/env";

//=============
// OBSŁUGA ZDJĘĆ
//=============

const photos = ref([null, null, null]);
const photoPreviews = ref([null, null, null]);
const activeIndex = ref(0);
const fileInput = ref(null);

const photoError = ref('');
const errorMessage = ref(''); // błąd ogólny (backend / rejestracja)

function uploadPhoto(index) {
  activeIndex.value = index;
  fileInput.value?.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  photos.value[activeIndex.value] = file;
  photoPreviews.value[activeIndex.value] = URL.createObjectURL(file);
  photoError.value = ''; // wyczyść błąd, jeśli było coś wrzucone
}

//===================
// OBSŁUGA REJESTRACJI
//===================

const store = useRegistrationStore();
const router = useRouter();
let storeAll = ref('');

async function handleFinish() {
  photoError.value = '';
  errorMessage.value = '';

  // walidacja: minimum jedno zdjęcie
  const hasAtLeastOnePhoto = photos.value.some((p) => p !== null);
  if (!hasAtLeastOnePhoto) {
    photoError.value = 'Please upload at least one photo.';
    return;
  }

  // zapisujemy zdjęcia do store
  store.updateStep('step3', {
    photos: photos.value,
  });

  storeAll = store.allData;
  const default_distance = 60;
  let credentialData;

  try {
    // 1. rejestracja credentials (email + password)
    const response = await fetch(`${SERVER_BASE_URL}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: storeAll.email,
        password: storeAll.password,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    credentialData = data;

    if (!response.ok || !credentialData.userId) {
      // np. email już istnieje
      errorMessage.value =
        credentialData?.error ||
        'Registration failed. This email may already be in use.';
      console.log('REGISTER ERROR:', text);
      return;
    }

    // 2. tworzenie profilu użytkownika
    const userData = new FormData();
    userData.append('user_id', credentialData.userId);
    userData.append('name', storeAll.name);
    userData.append('date_of_birth', storeAll.dateOfBirth);
    userData.append('gender', storeAll.gender);

    storeAll.preferred_gender.forEach((gender) => {
      userData.append('preferred_gender', gender);
    });

    // po zmianach w step2 mamy zwykłe wartości, nie .value
    userData.append(
      'preferred_min_age',
      Number(storeAll.age_preference[0])
    );
    userData.append(
      'preferred_max_age',
      Number(storeAll.age_preference[1])
    );
    userData.append('preferred_distance', default_distance);

    storeAll.photos.forEach((photo) => {
      if (photo) userData.append('photos', photo);
    });

    userData.append('longitude', 0);
    userData.append('latitude', 0);
    userData.append('bio', storeAll.bio);
    const userResponse = await fetch(`${SERVER_BASE_URL}/api/users/`, {
      method: 'POST',
      credentials: 'include',
      body: userData,
    });

    if (!userResponse.ok) {
      await fetch(
        `${SERVER_BASE_URL}/api/auth/credentials/${credentialData.userId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      errorMessage.value =
        'Could not create your profile. Please try again.';
      return;
    }

    const createdUser = await userResponse.json();
    console.log('USER CREATED:', createdUser);
    router.push('/profile');
  } catch (error) {
    console.log(error);
    errorMessage.value = 'Unexpected error. Please try again later.';
  }
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
  margin-bottom: 1rem;
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
  margin-top: 0.5rem;
}

/* jednolity styl błędów */
.error-text {
  width: 100%;
  margin: 0.4rem 0;
  font-size: 0.8rem;
  color: #cf4e7d;
  text-align: center;
}

.backend-error {
  margin-top: 0.2rem;
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
