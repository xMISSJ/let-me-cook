<script setup>
import { computed } from "vue";

defineOptions({
  name: "AppHeaderBar",
});

const emit = defineEmits(["navigate"]);
const props = defineProps({
  activeMenu: {
    type: String,
    required: true,
  },
});

const menuItems = [
  { key: "overview", label: "Recipes", icon: "utensils" },
  { key: "planner", label: "Planner", icon: "calendar" },
  { key: "profile", label: "Profile", icon: "user" },
];

const activeMenuIndex = computed(() => {
  const index = menuItems.findIndex((item) => item.key === props.activeMenu);
  return index >= 0 ? index : 0;
});

function navigateTo(menu) {
  emit("navigate", menu);
}
</script>

<template>
  <div>
    <div class="md:hidden px-4 py-3">
      <div class="grid gap-0.5">
        <p class="text-sm font-extrabold tracking-wide text-amber-900 dark:text-amber-50">LET ME COOK</p>
        <p class="text-[11px] text-amber-900/75 dark:text-amber-100/75">Your FYP, but edible.</p>
      </div>
    </div>

    <nav class="hidden items-center justify-between border-b border-amber-500/30 px-4 py-3 lg:px-5 md:flex">
      <div class="grid gap-0.5">
        <p class="text-base font-extrabold tracking-wide text-amber-900 dark:text-amber-50">LET ME COOK</p>
        <p class="text-xs text-amber-900/75 dark:text-amber-100/75">Your FYP, but edible.</p>
      </div>
      <div class="flex items-center gap-1">
        <button
          v-for="item in menuItems"
          :key="item.key"
          class="cursor-pointer rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-[color,background-color,box-shadow] duration-200 ease-out"
          :class="
            props.activeMenu === item.key
              ? 'bg-amber-500/10 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200'
              : 'text-amber-900/70 lg:hover:text-amber-900 dark:text-amber-100/70 dark:lg:hover:text-amber-100'
          "
          type="button"
          @click="navigateTo(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </nav>

    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-amber-500/40 bg-amber-50/95 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] backdrop-blur md:hidden dark:border-amber-300/20 dark:bg-zinc-900/95">
      <div class="relative grid grid-cols-3 rounded-xl bg-white/90 p-1 shadow-sm dark:bg-zinc-800/90">
        <span
          class="pointer-events-none absolute bottom-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-amber-500 shadow-sm transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :style="{ transform: `translateX(${activeMenuIndex * 100}%)` }"
          aria-hidden="true"
        />

        <button
          v-for="item in menuItems"
          :key="item.key"
          class="relative z-10 inline-flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-xs font-semibold transition-colors duration-200 ease-out"
          :class="
            props.activeMenu === item.key
              ? 'text-zinc-950'
              : 'text-amber-900/85 lg:hover:bg-amber-200/70 dark:text-amber-100/90 dark:lg:hover:bg-zinc-700'
          "
          type="button"
          @click="navigateTo(item.key)"
        >
          <svg
            v-if="item.icon === 'grid'"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
          </svg>
          <svg
            v-else-if="item.icon === 'utensils'"
            class="h-4 w-4"
            viewBox="0 0 512.043 512.043"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m466.648 45.419-.012-.013-.013-.012C434 12.776 401.447-2.001 367.103.217c-33.232 2.148-66.594 20.399-101.992 55.796-50.561 50.561-88.366 120.733-58.259 185.539L13.158 435.244c-17.544 17.545-17.544 46.094 0 63.64 17.544 17.543 46.094 17.545 63.64 0L270.383 305.3c60.39 28.332 130.167-2.888 185.647-58.368 35.397-35.397 53.648-68.759 55.796-101.992 2.219-34.344-12.559-66.897-45.178-99.521zm-63.651 106.054c-43.075 43.075-111.863 96.524-145.219 104.223l-1.43-1.43c8.658-37.521 69.296-110.293 104.222-145.219 22.365-22.365 63.586-63.693 84.853-42.426 19.414 19.412-11.446 53.871-42.426 84.852zM286.324 77.227c30.018-30.018 57.074-45.415 82.714-47.072 12.408-.802 24.105 1.761 35.07 6.555-22.354 10.432-44.772 31.146-64.751 51.124-35.451 35.451-85.821 95.845-105.554 140.54-23.728-52.065 12.008-110.635 52.521-151.147zm195.564 65.779c-1.657 25.64-17.054 52.696-47.072 82.713-45.043 45.042-101.789 74.765-150.969 52.556 43.394-19.141 104.16-69.386 140.362-105.588 19.979-19.979 40.698-42.402 51.129-64.761 5.142 11.734 7.306 23.381 6.55 35.08z"
              fill="currentColor"
            />
          </svg>
          <svg
            v-else-if="item.icon === 'calendar'"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M7 3.5v3M17 3.5v3M3.5 9.5h17" />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.2 2.9-5.5 7-5.5s7 2.3 7 5.5" />
          </svg>
          <span class="leading-none">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
