<template>
  <div class="signup-page">
    <div class="form-box">
      <h1>Personal info</h1>

      <input type="text" placeholder="Your name" />
      <select>
        <option disabled selected>Gender</option>
        <option>Female</option>
        <option>Male</option>
        <option>Other</option>
      </select>

      <select>
        <option disabled selected>Looking for</option>
        <option>Female</option>
        <option>Male</option>
        <option>Both</option>
      </select>

      <label class="age-label">Age range:</label>
      <div class="range-box">
        <input type="number" min="18" max="99" placeholder="From" />
        <span>-</span>
        <input type="number" min="18" max="99" placeholder="To" />
      </div>

      <button class="next-btn" @click="$router.push('/signup/step3')">Next</button>

      <p class="back">
        <a @click.prevent="$router.push('/signup/step1')" href="#">← Back</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupStep2'
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
  margin-bottom: 1rem;
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

.age-label {
  font-size: 0.9rem;
  color: #666;
  align-self: flex-start;
  margin-bottom: 0.3rem;
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
</style>
