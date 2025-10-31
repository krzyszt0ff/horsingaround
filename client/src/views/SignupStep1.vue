<template>
  <div class="signup-page">
    <div class="form-box">
      <h1>Sign up</h1>
      <input type="email" placeholder="E-mail address" />
      <input type="password" placeholder="Password" />
      <input type="password" placeholder="Repeat password" />

      <button class="next-btn" @click="$router.push('/signup/step2')">Next</button>

      <p class="alt">
        Already have an account?
        <a @click.prevent="$router.push('/login')" href="#">Sign in</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupStep1'
}
</script>

<style scoped>
/*  pełny ekran */
.signup-page {
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
