
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Search filters</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="filter-section">
            <label>Gender</label>
            <div class="pill-group">
              <button 
                v-for="g in availableGenders" 
                :key="g.value"
                :class="{ active: localGender === g.value }"
                @click="localGender = g.value"
              >
                {{ g.label }}
              </button>
            </div>
          </div>

          <div class="filter-section">
            <label>Age: <span>{{ localAgeRange[0] }} - {{ localAgeRange[1] }} years</span></label>
            <div class="slider-wrapper">
              <input 
                type="range" 
                :min="minAllowedAge" 
                :max="maxAllowedAge" 
                v-model.number="localAgeRange[0]" 
                class="range-input"
              >
              <input 
                type="range" 
                :min="minAllowedAge" 
                :max="maxAllowedAge" 
                v-model.number="localAgeRange[1]" 
                class="range-input"
              >
            </div>
            <p class="hint">Range limited by your profile settings</p>
          </div>

          <div class="filter-section">
            <label>Distance: <span>up to {{ localDistance }} km</span></label>
            <div class="slider-wrapper single">
              <input 
                type="range" 
                min="1" 
                :max="maxAllowedDistance" 
                v-model.number="localDistance" 
                class="range-input"
              >
            </div>
          </div>
        </div>

        <button class="apply-btn" @click="handleSave" :disabled="isSaving">
            {{ isSaving ? 'Applied! ✓' : 'Apply' }}
        </button>
        
      </div>
    </div>
  </Teleport>
</template>



<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  initialData: Object 
});

const emit = defineEmits([ 'save']);

const localGender = ref(props.initialData?.preferred_gender || 'all');
const localAgeRange = ref([
  props.initialData?.preferred_min_age || 18,
  props.initialData?.preferred_max_age || 99
]);
const localDistance = ref(props.initialData?.preferred_distance || 50);

const availableGenders = computed(() => {
  const base = props.initialData?.preferred_gender || [];
  const options = [];
  
  if (base.includes('female') && base.includes('male')) {
    options.push({ label: 'All', value: 'all' });
  }
  if (base.includes('female')) {
    options.push({ label: 'Woman', value: 'female' });
  }
  if (base.includes('male')) {
    options.push({ label: 'Men', value: 'male' });
  }
  if (base.includes('other')) {
    options.push({ label: 'Other', value: 'other' });
  }
  return options;
});

const minAllowedAge = props.initialData?.preferred_min_age || 18;
const maxAllowedAge = props.initialData?.preferred_max_age || 99;
const maxAllowedDistance = props.initialData?.preferred_distance || 100;

const isSaving = ref(false);

const handleSave = async () => {
  isSaving.value = true;
  
  emit('save', {
    preferred_gender: localGender.value === 'all' ? ['female', 'male'] : [localGender.value],
    preferred_min_age: localAgeRange.value[0],
    preferred_max_age: localAgeRange.value[1],
    preferred_distance: localDistance.value
  });

  setTimeout(() => {
    isSaving.value = false;
  }, 1000);
};
</script>

<style scoped>

  .modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    z-index: 999;
  }

  .modal-content {
    background: white; width: 90%; max-width: 400px;
    border-radius: 24px; padding: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .modal-header h2 { margin: 0; color: #c75b85; font-size: 1.5rem; }
  .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #aaa; }

  .filter-section { margin-bottom: 2rem; }
  .filter-section label { display: block; margin-bottom: 10px; font-weight: 700; color: #333; }
  .filter-section label span { float: right; color: #e67da8; }

  .pill-group { display: flex; gap: 10px; }
  .pill-group button { 
    flex: 1; padding: 10px; border-radius: 12px; border: 1px solid #eee;
    background: #f9f9f9; cursor: pointer; font-weight: 600; transition: 0.2s;
  }
  .pill-group button.active { background: #e67da8; color: white; border-color: #e67da8; }

  .slider-wrapper { position: relative; height: 30px; margin-top: 10px; }
  .range-input {
    position: absolute; width: 100%; pointer-events: none; appearance: none; background: none;
  }
  .range-input::-webkit-slider-thumb {
    height: 20px; width: 20px; border-radius: 50%; background: #e67da8;
    pointer-events: auto; appearance: none; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  .range-input::-webkit-slider-runnable-track { width: 100%; height: 6px; background: #f0f0f0; border-radius: 3px; }

  .apply-btn {
    width: 100%; padding: 14px; border-radius: 15px; border: none;
    background: linear-gradient(90deg, #e67da8, #c75b85);
    color: white; font-weight: 700; cursor: pointer;
  }

  .slider-wrapper {
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
  }
  .range-input {
    position: absolute;
    width: 100%;
    pointer-events: none;
    appearance: none;
    background: none;
  }
  .range-input::-webkit-slider-thumb {
    pointer-events: auto;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #e67da8;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
  }
/* Wykorzystaj swoje style z Filtru, dodając poprawkę dla pojedynczego slidera */
.slider-wrapper.single {
  display: block;
}
.slider-wrapper.single .range-input {
  pointer-events: auto; /* Dla pojedynczego suwaka włączamy eventy na całym pasku */
}
/* ... reszta Twoich stylów CSS ... */
</style>