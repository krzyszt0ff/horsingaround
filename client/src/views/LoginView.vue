<template>
  <div class="login-page">
    <div class="overlay">
      <div class="login-content">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <h1 class="title">Horsing Around</h1>

        <button class="signup-btn" @click="$router.push('/signup/step1')">
          Sign up
        </button>

        <p class="switch">
          Already a user?
          <a @click.prevent="$router.push('/login')" href="#">Sign in</a>
        </p>
      </div>

      <div class="promo-text">
        <h2>Gorące konie w twojej okolicy!</h2>
        <h3>Zarejestruj się już dzisiaj!</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
}
</script>

<style scoped>

.login-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  background-image: url('@/assets/horses-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  font-family: 'Poppins', sans-serif;
}

/* różowa przezroczysta warstwa */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 192, 203, 0.8), rgba(255, 182, 193, 0.4));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8%;
}

/* lewy panel z logo i przyciskiem */
.login-content {
  background: linear-gradient(180deg, #f8d7e0 0%, #fff 100%);
  border-radius: 20px;
  padding: 3rem 4rem;
  text-align: center;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.8rem;
  color: #a94e74;
  margin-bottom: 2rem;
}

.signup-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  border: none;
  border-radius: 40px;
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.8rem 2.5rem;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.signup-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.switch {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.switch a {
  color: #cf4e7d;
  text-decoration: none;
}

/* prawa sekcja tekstowa */
.promo-text {
  color: white;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  max-width: 400px;
}

.promo-text h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.promo-text h3 {
  font-size: 1.4rem;
  font-weight: 400;
}
</style>
