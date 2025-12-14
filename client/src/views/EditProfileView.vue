<template>
  <div class="edit-page">
    <div class="form-box">
      <h1>Edit Profile</h1>

      <label>Name</label>
      <input 
        v-model="form.name" 
        type="text" 
        placeholder="Your name" 
      />

      <label>Birth date</label>
      <input 
        v-model="form.date_of_birth" 
        type="date" 
      />

      <select v-model="form.gender">
        <option disabled value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <label>Age range</label>
      <div class="range-box">
        <input 
          type="number" 
          v-model.number="form.preferred_min_age" 
          min="18" 
          max="99" 
          placeholder="From"
        />
        <span>-</span>
        <input 
          type="number" 
          v-model.number="form.preferred_max_age" 
          min="18" 
          max="99" 
          placeholder="To"
        />
      </div>

      <label>Looking for:</label>
      <div class="checkbox-group">
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

      <label>Bio</label>
      <textarea 
        class="bio-textarea"
        v-model="form.bio" 
        rows="4" 
        placeholder="Tell us something about yourself..."
        maxlength="500"
      ></textarea>
      <div class="bio-footer">
        <span></span> 
        <span class="char-count">{{ form.bio.length }}/500</span>
      </div>

      <div class="buttons">
        <button class="save-btn" @click="handleSave">Save</button>
        <button class="cancel-btn" @click="handleCancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const store = useUserStore();

const form = reactive({
  name: '',
  gender: '',
  date_of_birth: '',
  bio: '',
  preferred_min_age: 18,
  preferred_max_age: 50,
  preferred_gender: [] 
});

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

onMounted(async () => {
  if (!store.user) {
    await store.loadUser();
  }
  if (store.user) {
    form.name = store.user.name;
    form.gender = store.user.gender;
    form.date_of_birth = formatDate(store.user.date_of_birth);
    form.bio = store.user.bio || '';
    form.preferred_min_age = store.user.preferred_min_age;
    form.preferred_max_age = store.user.preferred_max_age;
    form.preferred_gender = [...store.user.preferred_gender];
  }
});

async function handleSave() {
  try {
    if (form.preferred_min_age > form.preferred_max_age) {
      alert("Min age cannot be greater than max age.");
      return;
    }
    const formData = new FormData();
    
    formData.append('name', form.name);
    formData.append('bio', form.bio);
    formData.append('gender', form.gender);
    formData.append('date_of_birth', form.date_of_birth);
    formData.append('preferred_distance', form.preferred_distance);
    formData.append('preferred_min_age', form.preferred_min_age);
    formData.append('preferred_max_age', form.preferred_max_age);
    form.preferred_gender.forEach(item => {
      formData.append('preferred_gender', item);
    });
    const response = await fetch("http://localhost:3000/api/users/update-profile", {
      method: "PUT",
      credentials: "include",
      body: formData 
    });
    
    if (!response.ok) {
        const errData = await response.json(); 
        throw new Error(errData.message || "Błąd zapisu");
    }
    
    const result = await response.json();
    if (result.data) {
       Object.assign(store.user, result.data);
    } 

    router.push('/profile');
  } catch (error) {
    console.error(error);
    alert("Failed to save changes: " + error.message);
  }
}

function handleCancel() {
  router.push('/profile');
}
</script>

<style scoped>
.edit-page {
  width: 100vw;
  min-height: 100vh; 
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  font-family: 'Poppins', sans-serif;
  padding: 2rem 0; 
}

.form-box {
  background: white;
  padding: 3rem 4rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 380px; 
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
  margin-top: 1.5rem;
  gap: 1rem;
}

.save-btn, .cancel-btn {
  border: none;
  border-radius: 40px;
  padding: 0.8rem 0; 
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