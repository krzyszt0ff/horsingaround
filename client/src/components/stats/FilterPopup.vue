<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Filtry</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="filter-section">
            <label>Płeć</label>
            <div class="pill-group">
              <button 
                v-for="g in genders" 
                :key="g.value"
                :class="{ active: gender === g.value }"
                @click="$emit('update:gender', g.value)"
              >
                {{ g.label }}
              </button>
            </div>
          </div>

          <div class="filter-section">
            <label>Wiek: <span>{{ ageRange[0] }} - {{ ageRange[1] }} lat</span></label>
            <div class="slider-wrapper">
              <input type="range" min="18" max="80" :value="ageRange[0]" 
                     @input="updateMin($event.target.value)" class="range-input">
              <input type="range" min="18" max="80" :value="ageRange[1]" 
                     @input="updateMax($event.target.value)" class="range-input">
            </div>
          </div>
        </div>

        <button class="apply-btn" @click="applyFilters">Zastosuj</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>

  import { GENDER_OPTIONS } from '../../constants/genders.js';

  const props = defineProps({
    isOpen: Boolean,
    gender: String,
    ageRange: Array
  });

  const emit = defineEmits(['close', 'update:gender', 'update:ageRange', 'apply']);

  const genders = [
    { label: 'All', value: 'all' },
    ...GENDER_OPTIONS ];

  const updateMin = (val) => {
    const min = parseInt(val);
    if (min >= props.ageRange[1]) return;
    emit('update:ageRange', [min, props.ageRange[1]]);
  };

  const updateMax = (val) => {
    const max = parseInt(val);
    if (max <= props.ageRange[0]) return;
    emit('update:ageRange', [props.ageRange[0], max]);
  };

  const applyFilters = () => {
    emit('apply');
    emit('close');
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
</style>