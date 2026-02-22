import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './app/router'
import './app/styles/index.scss'

createApp(App).use(createPinia()).use(router).mount('#app')
