import { createApp } from 'vue'
//import './style.css'
import App from './App.vue'

import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

import ganttastic from '@infectoone/vue-ganttastic'

const app = createApp(App);
app.use(Antd).use(ganttastic).mount("#app");
//createApp(App).mount('#app')