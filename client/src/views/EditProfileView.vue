<template>
  <div class="edit-page">
    <div class="form-box">
      <h1>Edit Profile</h1>

      <label>Name</label>
      <input 
        v-model="form.name" 
        type="text" 
        placeholder="Your name" 
        :class="{ 'input-error': errors.name }"
      />
      <p v-if="errors.name" class="error-text">{{ errors.name }}</p>

      <label>Birth date</label>
      <input 
        v-model="form.date_of_birth" 
        type="date" 
        :class="{ 'input-error': errors.date_of_birth }"
      />
      <p v-if="errors.date_of_birth" class="error-text">{{ errors.date_of_birth }}</p>

      <label>Gender</label>
      <select v-model="form.gender" :class="{ 'input-error': errors.gender }">
        <option disabled value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <p v-if="errors.gender" class="error-text">{{ errors.gender }}</p>

      <label>Age range</label>
      <div class="range-box">
        <input 
          type="number" 
          v-model.number="form.preferred_min_age" 
          min="18" 
          max="99" 
          :class="{ 'input-error': errors.preferred_min_age }"
        />
        <span>-</span>
        <input 
          type="number" 
          v-model.number="form.preferred_max_age" 
          min="18" 
          max="99" 
          :class="{ 'input-error': errors.preferred_min_age }"
        />
      </div>
      <p v-if="errors.preferred_min_age" class="error-text">{{ errors.preferred_min_age }}</p>

      <label>Looking for:</label>
      <div class="checkbox-group" :class="{ 'group-error': errors.preferred_gender }">
        <label class="checkbox-item">
          <input type="checkbox" value="male" v-model="form.preferred_gender" /> Men
        </label>
        <label class="checkbox-item">
          <input type="checkbox" value="female" v-model="form.preferred_gender" /> Women
        </label>
        <label class="checkbox-item">
          <input type="checkbox" value="other" v-model="form.preferred_gender" /> Others
        </label>
      </div>
      <p v-if="errors.preferred_gender" class="error-text">{{ errors.preferred_gender }}</p>

      <label>Bio</label>
      <textarea 
        class="bio-textarea"
        v-model="form.bio" 
        rows="4" 
        placeholder="Tell us something about yourself..."
        maxlength="500"
        :class="{ 'input-error': errors.bio }"
      ></textarea>
      <div class="bio-footer">
        <p v-if="errors.bio" class="error-text">{{ errors.bio }}</p>
        <span class="char-count">{{ form.bio.length }}/500</span>
      </div>

      <p v-if="errors.backend" class="error-text central-error">{{ errors.backend }}</p>

      <div class="buttons">
        <button class="photo-btn" @click="$router.push('/profile/edit/photos')">Edit Photos</button>
        <button class="save-btn" @click="handleSave" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button class="cancel-btn" @click="handleCancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { SERVER_BASE_URL } from "@/config/env";
import { z } from 'zod';

const router = useRouter();
const store = useUserStore();
const isSaving = ref(false);

const form = reactive({
  name: '',
  gender: '',
  date_of_birth: '',
  bio: '',
  preferred_min_age: 18,
  preferred_max_age: 99,
  preferred_gender: [] 
});

const errors = ref({
  name: '',
  gender: '',
  date_of_birth: '',
  bio: '',
  preferred_min_age: '',
  preferred_gender: '',
  backend: ''
});

const editSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  gender: z.string().min(1, 'Please select your gender'),
  bio: z.string().trim().min(1, 'Bio cannot be empty'),
  date_of_birth: z.string().refine((val) => {
    const birth = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18;
  }, 'You must be at least 18 years old'),
  preferred_min_age: z.number().min(18, 'Minimal age is 18'),
  preferred_max_age: z.number().min(18, 'Maximal age is 18'),
  preferred_gender: z.array(z.string()).min(1, 'Select at least one preference')
}).refine((data) => data.preferred_min_age <= data.preferred_max_age, {
  message: 'Max age must be greater than or equal to min age',
  path: ['preferred_min_age']
});

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

onMounted(async () => {
  if (!store.user) await store.loadUser();
  if (store.user) {
    form.name = store.user.name;
    form.gender = store.user.gender;
    form.date_of_birth = formatDate(store.user.date_of_birth);
    form.bio = store.user.bio || '';
    form.preferred_min_age = store.user.preferred_min_age || 18;
    form.preferred_max_age = store.user.preferred_max_age || 99;
    form.preferred_gender = [...(store.user.preferred_gender || [])];
  }
});

async function handleSave() {
  Object.keys(errors.value).forEach(k => errors.value[k] = '');
  
  const result = editSchema.safeParse(form);

  if (!result.success) {
    result.error.issues.forEach(issue => {
      errors.value[issue.path[0]] = issue.message;
    });
    return;
  }

  try {
    isSaving.value = true;
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'preferred_gender') {
        form[key].forEach(val => formData.append(key, val));
      } else {
        formData.append(key, form[key]);
      }
    });

    const response = await fetch(`${SERVER_BASE_URL}/api/users/update-profile`, {
      method: "PUT",
      credentials: "include",
      body: formData 
    });
    
    if (!response.ok) {
      const errData = await response.json(); 
      throw new Error(errData.message || "Save failed");
    }
    
    const resultJson = await response.json();
    if (resultJson.data) Object.assign(store.user, resultJson.data);
    router.push('/profile');
  } catch (error) {
    errors.value.backend = error.message;
  } finally {
    isSaving.value = false;
  }
}

function handleCancel() {
  router.push('/profile');
}
</script>

<style scoped>
.error-text {
  color: #cf4e7d;
  font-size: 0.8rem;
  width: 100%;
  text-align: left;
  margin-top: -0.2rem;
  margin-bottom: 0.5rem;
}

.input-error {
  border-color: #cf4e7d !important;
}

.central-error {
  text-align: center;
}

.form-box {
  background: white; padding: 3rem 4rem; border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex; flex-direction: column; align-items: center;
  width: 480px; margin: 2rem auto;
}
.form-box {
  background: white;
  padding: 3rem 4rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 480px; 
  margin: 2rem;
}

h1 {
  color: #a94e74;
  margin-bottom: 1.5rem;
  text-align: center;
}

input,
select,
.bio-textarea {
  width: 100%;
  margin-bottom: 0.4rem;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  background: white; 
  box-sizing: border-box; 
}

input:focus, select:focus, .bio-textarea:focus {
  outline: none;
  border-color: #e67da8;
}

.bio-textarea {
  resize: vertical;
  min-height: 80px;
  max-height: 150px;
}

.bio-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.char-count {
  font-size: 0.75rem;
  color: #aaa;
}

.range-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.4rem;
}

.range-box input {
  width: 45%;
  text-align: center;
  margin-bottom: 0; 
}

label {
  font-size: 0.9rem;
  color: #666;
  align-self: flex-start;
  margin-bottom: 0.3rem;
  margin-top: 0.5rem; 
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
  margin-top: 0.2rem;
  cursor: pointer;
}

.checkbox-item input {
  width: auto;
  margin-bottom: 0;
  accent-color: #e67da8;
}

.buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}
.photo-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white;
  white-space: nowrap;
}
.photo-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(207, 78, 125, 0.3);
}
.save-btn, .cancel-btn, .photo-btn {
  border: none;
  border-radius: 40px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
  flex: 1; 
}

.save-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white;
}

.save-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(207, 78, 125, 0.3);
}

.cancel-btn {
  background: #f3f3f3;
  color: #a94e74;
}

.cancel-btn:hover {
  background: #e9e9e9;
  transform: scale(1.03);
}
</style>

