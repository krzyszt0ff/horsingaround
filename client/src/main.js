import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faHeart,
  faAward,
  faMessage,
  faUser,
  faSliders,
  faX,
  faChevronUp,
  faChevronDown,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

library.add(faHeart, faAward, faMessage, faUser, faSliders, faX, faChevronUp, faChevronDown, faChevronLeft)

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
