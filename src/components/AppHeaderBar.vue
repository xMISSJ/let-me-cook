<template>
  <div>
    <div class="md:hidden px-4 py-3.5">
      <button class="grid gap-0.5 text-left" type="button" @click="navigateTo('overview')">
        <p class="font-brand-name text-[2.15rem] leading-[0.95] text-amber-600 dark:text-amber-50">{{ t("appName") }}</p>
        <p class="font-brand-rounded text-lg font-medium text-amber-600/70 dark:text-amber-100/75">{{ t("brandTagline") }}</p>
      </button>
    </div>

    <nav class="hidden items-center justify-between border-b border-amber-500/30 px-4 py-3 lg:px-5 md:flex">
      <button class="grid gap-0.5 text-left" type="button" @click="navigateTo('overview')">
        <p class="font-brand-name text-[2.65rem] leading-[0.95] text-amber-600 dark:text-amber-50">{{ t("appName") }}</p>
        <p class="font-brand-rounded text-xl font-medium text-amber-600/70 dark:text-amber-100/75">{{ t("brandTagline") }}</p>
      </button>
      <div class="flex items-center gap-3">
        <p
          v-if="props.guestName"
          class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/80 px-2.5 py-1 text-xs text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <img
            :src="props.guestAvatarSrc"
            :alt="props.guestAvatarAlt"
            class="h-4 w-4 rounded-full object-cover"
            loading="lazy"
          />
          <span>{{ t("profile.usingAppAs", { name: props.guestName }) }}</span>
        </p>
        <div class="flex items-center gap-1">
        <button
          v-for="item in menuItems"
          :key="item.key"
          class="group cursor-pointer rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-[color,background-color,box-shadow,transform] duration-200 ease-out lg:hover:-translate-y-0.5 lg:hover:shadow-sm"
          :class="
            props.activeMenu === item.key
              ? 'bg-amber-500/10 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200'
              : 'text-amber-900/70 lg:hover:bg-amber-500/5 lg:hover:text-amber-900 dark:text-amber-100/70 dark:lg:hover:bg-amber-100/5 dark:lg:hover:text-amber-100'
          "
          type="button"
          @click="navigateTo(item.key)"
        >
          <span class="inline-flex items-center gap-1.5">
            <span>{{ item.label }}</span>
          </span>
        </button>
        </div>
      </div>
    </nav>

    <nav class="fixed inset-x-0 bottom-[-2px] z-40 border-t border-amber-500/40 bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom,0)+1rem)] backdrop-blur md:hidden dark:border-amber-300/20 dark:bg-zinc-900">
      <SegmentedToggle
        :model-value="props.activeMenu"
        :items="menuItems"
        container-class="rounded-xl bg-white/90 p-1 shadow-sm dark:bg-zinc-800/90"
        indicator-class="top-1 bottom-1 left-1 bg-amber-500 shadow-sm"
        button-class="inline-flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-xs font-semibold transition-colors duration-200 ease-out"
        active-button-class="text-white"
        inactive-button-class="text-amber-900/85 lg:hover:bg-zinc-200/70 dark:text-amber-100/90 dark:lg:hover:bg-zinc-700"
        @update:model-value="navigateTo"
      >
        <template #option="{ item }">
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
            class="h-[1.125rem] w-[1.125rem]"
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
            v-else-if="item.icon === 'heart'"
            class="h-4 w-4"
            viewBox="0 0 512 512"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              :d="
                props.activeMenu === item.key
                  ? 'M461.2 314c-22.6 27.4-122 109.4-173.7 151.4-18.4 15-44.7 15-63.1 0-51.7-42-151-124-173.7-151.4C16.1 272.3 0 232.6 0 189.4c0-42.2 14.4-81 40.6-109.4C67.2 51.3 103.5 35.4 143 35.4c29.6 0 56.6 9.4 80.4 27.8 12.4 9.7 23.4 21.1 32.5 34 9.2-12.8 20.1-24.3 32.5-34 23.8-18.5 50.9-27.8 80.5-27.8 39.6 0 75.9 15.9 102.4 44.6 26.1 28.4 40.6 67.1 40.6 109.4.1 43.2-16 82.9-50.7 124.6z'
                  : 'M461.2 314c-22.6 27.4-122 109.4-173.7 151.4-18.4 15-44.7 15-63.1 0-51.7-42-151-124-173.7-151.4C16.1 272.3 0 232.6 0 189.4c0-42.2 14.4-81 40.6-109.4C67.2 51.3 103.5 35.4 143 35.4c29.6 0 56.6 9.4 80.4 27.8 12.4 9.7 23.4 21.1 32.5 34 9.2-12.8 20.1-24.3 32.5-34 23.8-18.5 50.9-27.8 80.5-27.8 39.6 0 75.9 15.9 102.4 44.6 26.1 28.4 40.6 67.1 40.6 109.4.1 43.2-16 82.9-50.7 124.6z'
              "
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
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
        </template>
      </SegmentedToggle>
    </nav>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SegmentedToggle from "./SegmentedToggle.vue";

defineOptions({
  name: "AppHeaderBar",
});

const emit = defineEmits(["navigate"]);
const { t } = useI18n();
const props = defineProps({
  activeMenu: {
    type: String,
    required: true,
  },
  guestName: {
    type: String,
    default: "",
  },
  guestAvatarSrc: {
    type: String,
    default: "",
  },
  guestAvatarAlt: {
    type: String,
    default: "Profile avatar",
  },
});

const menuItems = computed(() => [
  { key: "overview", label: t("nav.recipes"), icon: "utensils" },
  { key: "favorites", label: t("nav.favorites"), icon: "heart" },
  { key: "planner", label: t("nav.planner"), icon: "calendar" },
  { key: "profile", label: t("nav.profile"), icon: "user" },
]);

function navigateTo(menu) {
  emit("navigate", menu);
}
</script>
