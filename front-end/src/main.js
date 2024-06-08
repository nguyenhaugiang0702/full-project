import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import { Card, Table, Menu, List, Drawer, Button, Dropdown } from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import PrimeVue from 'primevue/config';

//in main.js
import 'primevue/resources/themes/aura-light-green/theme.css'



const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(PrimeVue);
app.use(Button);
app.use(Card);
app.use(Table);
app.use(Drawer);
app.use(Menu);
app.use(List);
app.use(Dropdown);
app.mount("#app");
