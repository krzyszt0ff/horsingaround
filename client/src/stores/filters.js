import { reactive } from 'vue';

export const sessionFilters = reactive({
  gender: 'all',
  ageRange: [18, 99],
  distance: 50,
  isActive: false 
});