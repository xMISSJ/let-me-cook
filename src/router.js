import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", name: "overview" },
  { path: "/favorites", name: "favorites" },
  { path: "/planner", name: "planner" },
  { path: "/profile", name: "profile" },
  { path: "/recipe/:id", name: "recipe" },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

export default router;
