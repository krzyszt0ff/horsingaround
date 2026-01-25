<template>
  <div class="signup-page">
    <div class="form-box">
      <h1>Personal info</h1>

      <input
        type="text"
        v-model="name"
        placeholder="Your name"
      />
      <p v-if="errors.name" class="error-text">{{ errors.name }}</p>

      <select v-model="gender">
        <option disabled value="">Gender</option>
        <option
          v-for="opt in GENDER_OPTIONS"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <p v-if="errors.gender" class="error-text">{{ errors.gender }}</p>

      <label>Looking for:</label>
      <div class="checkbox-group">
        <label
          v-for="opt in GENDER_OPTIONS"
          :key="opt.value"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :value="opt.value"
            v-model="preferredGenders"
          />
          {{ opt.label }}
        </label>
      </div>
      <p v-if="errors.preferredGenders" class="error-text">
        {{ errors.preferredGenders }}
      </p>

      <label>Your birth date</label>
      <input v-model="dateOfBirth" type="date" />
      <p v-if="errors.dateOfBirth" class="error-text">
        {{ errors.dateOfBirth }}
      </p>

      <label>Age range:</label>
      <div class="range-box">
        <input
          type="number"
          v-model="age_min"
          min="18"
          max="99"
          placeholder="From"
        />
        <span>-</span>
        <input
          type="number"
          v-model="age_max"
          min="18"
          max="99"
          placeholder="To"
        />
      </div>
      <p v-if="errors.age_min || errors.age_max" class="error-text">
        {{ errors.age_min || errors.age_max }}
      </p>
      <label>Bio</label>
      <textarea
        class="bio-textarea"
        v-model="bio"
        placeholder="Tell us something about yourself..."
        rows="3"
      ></textarea>
      <div class="bio-footer">
        <p v-if="errors.bio" class="error-text">{{ errors.bio }}</p>
        <span class="char-count" :class="{ 'limit-reached': bio.length > 500 }">
          {{ bio.length }}/500
        </span>
      </div>
      <button class="next-btn" @click="handleNext">Next</button>


      <p class="back">
        <a @click.prevent="$router.push('/signup/step1')" href="#">← Back</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRegistrationStore } from '@/stores/registration';
import { GENDER_OPTIONS } from '@/constants/genders';
import { z } from 'zod';

const store = useRegistrationStore();
const router = useRouter();

const name = ref('');
const gender = ref('');
const preferredGenders = ref([]);
const dateOfBirth = ref('');
const age_min = ref('');
const age_max = ref('');
const bio = ref(''); //dodawanie bio, bo ciągle było na sztywno

// błędy walidacji
const errors = ref({
  name: '',
  gender: '',
  preferredGenders: '',
  dateOfBirth: '',
  age_min: '',
  age_max: '',
  bio: '',
});

// schemat walidacji
const registrationSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Your name must be at least 3 characters'),
    gender: z
      .string()
      .min(1, 'Please select your gender!'),
    preferredGenders: z
      .array(z.string())
      .min(1, 'Please select your preferred genders!'),
    dateOfBirth: z
      .string()
      .refine((dateStr) => {
        const birth = new Date(dateStr);
        if (isNaN(birth.getTime())) return false;

        const today = new Date();
        const age =
          today.getFullYear() -
          birth.getFullYear() -
          (today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() &&
            today.getDate() < birth.getDate())
            ? 1
            : 0);

        return age >= 18;
      }, 'You must be at least 18 years old!'),
    age_min: z
      .coerce
      .number()
      .min(18, 'Minimal age must be at least 18'),
    age_max: z
      .coerce
      .number()
      .min(18, 'Maximal age must be at least 18'),
    bio: z
      .string()
      .trim()
      .min(10, 'Bio must be at least 10 characters long')
      .max(500, 'Bio cannot exceed 500 characters'),
  })
  .refine((data) => data.age_min <= data.age_max, {
    message: 'Your minimal preferred age should be lower than the maximal!',
    path: ['age_min'],
  });

async function handleNext() {
  // wyczyść błędy
  errors.value = {
    name: '',
    gender: '',
    preferredGenders: '',
    dateOfBirth: '',
    age_min: '',
    age_max: '',
    bio: '',
  };

  const result = registrationSchema.safeParse({
    name: name.value,
    gender: gender.value,
    preferredGenders: preferredGenders.value,
    dateOfBirth: dateOfBirth.value,
    age_min: age_min.value,
    age_max: age_max.value,
    bio: bio.value,
  });

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && errors.value[field] === '') {
        errors.value[field] = issue.message;
      }
    });
    return;
  }

  store.updateStep('step2', {
    name: name.value,
    dateOfBirth: dateOfBirth.value,
    gender: gender.value,
    preferred_gender: preferredGenders.value,
    age_preference: [age_min.value, age_max.value],
    bio: bio.value,
  });

  router.push('/signup/step3');
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
  width: 360px;
}

h1 {
  color: #a94e74;
  margin-bottom: 1.5rem;
}

input,
select {
  width: 100%;
  margin-bottom: 0.4rem;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

select {
  background-color: white;
}

.range-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.range-box input {
  width: 45%;
  text-align: center;
}

label {
  font-size: 0.9rem;
  color: #666;
  align-self: flex-start;
  margin-bottom: 0.3rem;
}

/* wspólna klasa na błędy */
.error-text {
  width: 100%;
  margin: 0 0 0.6rem 0;
  font-size: 0.8rem;
  color: #cf4e7d;
  text-align: left;
}

.next-btn {
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

.next-btn:hover {
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

.checkbox-group {
  width: 100%;
  margin-bottom: 0.4rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  color: black;
}

.checkbox-item input {
  width: auto;
  margin-bottom: 0;
}
</style>
