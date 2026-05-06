import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import ui from "@nuxt/ui/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss(), ui()],
  // Update this if you change the GitHub repository name.
  base: "/let-me-cook/",
});
