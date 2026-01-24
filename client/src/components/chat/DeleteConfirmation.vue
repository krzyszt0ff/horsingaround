<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        
        <div class="modal-buttons">
          <button class="confirm-btn" @click="$emit('confirm')">Delete</button>
          <button class="cancel-btn" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String
});
defineEmits(['close', 'confirm']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

h3 { color: #a94e74; margin-bottom: 1rem; }
p { color: #666; margin-bottom: 1.5rem; }

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 0.8rem 1.5rem;
  border-radius: 40px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  flex: 1;
}

.confirm-btn {
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color: white;
}

.cancel-btn {
  background: #f3f3f3;
  color: #666;
}

button:hover { transform: scale(1.05); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
p {
  color: #666;
  margin-bottom: 1.5rem;
  white-space: pre-line; 
}
</style>