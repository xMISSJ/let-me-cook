import "./style.css";
import { createApp } from "vue";
import ui from "@nuxt/ui/vue-plugin";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";

const app = createApp(App);
app.use(i18n).use(router).use(ui);

router.isReady().finally(() => {
  app.mount("#app");
});
