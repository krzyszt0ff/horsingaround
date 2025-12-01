<template>
  <div class="signin-page">
    <div class="form-box">
      <h1>Sign in</h1>
      <input type="email" v-model="email" placeholder="E-mail address" />
      <input type="password" v-model="password" placeholder="Password" />
      <p class="alt">
            <a class="alt" href="https://www.youtube.com/watch?v=4HSBCfCxy7U">Forgot your password?</a>
      </p>

      <button class="btn" @click="signIn">Sign in</button>

      <p class="alt">
        Don't have an account?
        <a @click.prevent="$router.push('/signup/step1')" href="#">Sign up</a>
      </p>

    </div>
  </div>
    </template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()

const email = ref('')
const password = ref('')

async function signIn() {
    try{
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
            }),
            });
        const data = await response.json();
        if (response.ok && data.success) {
          await store.loadUser();
          router.push('/profile');
        } else {
           console.log("Login failed:", data.error);
        }
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
/*  pełny ekran */
.signin-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center; /* wyśrodkowanie w poziomie */
  align-items: center; /* wyśrodkowanie w pionie */
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
}

/*  panel formularza */
.form-box {
  background: white;
  padding: 3rem 4rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 340px;
}

h1 {
  color: #a94e74;
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: 0.2s;
}

input:focus {
  border-color: #cf4e7d;
  outline: none;
  box-shadow: 0 0 4px rgba(207, 78, 125, 0.3);
}

.btn {
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

.btn:hover {
  transform: scale(1.05);
}

.alt {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.alt a {
  color: #cf4e7d;
  text-decoration: none;
}
</style>