import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './markdown.css'
import router from './router'
import './style.css'

const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
