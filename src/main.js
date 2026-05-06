import "./style.css";
import { createApp } from "vue";
import ui from "@nuxt/ui/vue-plugin";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";

createApp(App).use(i18n).use(router).use(ui).mount("#app");
