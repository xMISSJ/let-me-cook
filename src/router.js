import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "overview" },
  { path: "/planner", name: "planner" },
  { path: "/profile", name: "profile" },
  { path: "/recipe/:id", name: "recipe" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

export default router;
