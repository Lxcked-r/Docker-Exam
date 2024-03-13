import "./assets/main.css";

import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ContextMenu);

app.mount("#app");
