<template>
  <div class="signin-page">
    <div class="form-box">
      <h1>Sign in</h1>

      <input
        type="email"
        v-model="email"
        placeholder="E-mail address"
      />
      <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

      <input
        type="password"
        v-model="password"
        placeholder="Password"
      />
      <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

      <p class="alt">
        <a href="https://www.youtube.com/watch?v=4HSBCfCxy7U">
          Forgot your password?
        </a>
      </p>

      <button class="btn" @click="signIn">Sign in</button>

      <!-- ogólny błąd (np. inne problemy z backendem) -->
      <p v-if="errors.backend" class="backend-error">
        {{ errors.backend }}
      </p>

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
import { useUserStore } from '@/stores/user';
import { z } from 'zod';
import { SERVER_BASE_URL } from "@/config/env";

const router = useRouter();
const store = useUserStore();

const email = ref('');
const password = ref('');

const errors = ref({
  email: '',
  password: '',
  backend: '',
});

// ŁADNE TEKSTY WALIDACJI
const loginSchema = z.object({
  email: z
    .string()
    .email('Email should look like example@gmail.com'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

async function signIn() {
  // wyczyść błędy
  errors.value = { email: '', password: '', backend: '' };

  // 1. lokalna walidacja
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
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

  // 2. request do backendu
  try {
    const response = await fetch(`${SERVER_BASE_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();
    const errMsg = (data && data.error) || 'Wrong email or password.';
    console.log(data)
    if (response.ok && data.success) {
      await store.loadUser();
      router.push('/app');
      return;
    }
    // 3. mapowanie błędów backendu na konkretne pola

    // a) email nie istnieje
    if (
      response.status === 404 ||
      /not\s*found/i.test(errMsg) && /user|email/i.test(errMsg)
    ) {
      errors.value.email = 'No account found for this email.';
      return;
    }

    // b) hasło nie pasuje do maila
    if (
      response.status === 401 ||
      /password/i.test(errMsg) ||
      /credential/i.test(errMsg)
    ) {
      errors.value.password = 'Password does not match this email or user with this email does not exist.';
      return;
    }

    // c) inne błędy – pokaż ogólny komunikat
    errors.value.backend = errMsg;

  } catch (error) {
    console.log(error);
    errors.value.backend = 'Server error. Try again later.';
  }
}
</script>

<style scoped>
/*  pełny ekran */
.signin-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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
  margin-bottom: 0.4rem;
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

/* tekst błędu pod polami */
.error-text {
  width: 100%;
  margin: -0.4rem 0 0.7rem 0;
  font-size: 0.8rem;
  color: #cf4e7d;
  text-align: left;
}

/* błąd globalny */
.backend-error {
  margin-top: 1rem;
  color: #cf4e7d;
  font-size: 0.9rem;
  text-align: center;
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
