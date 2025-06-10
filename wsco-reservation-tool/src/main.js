import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import './assets/css/global.css'
import 'toast-ui-calendar-vue3/styles.css';

createApp(App).use(router).mount('#app');
