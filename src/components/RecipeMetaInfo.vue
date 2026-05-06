<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();
</script>

<template>
  <div
    class="inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-amber-500/30 bg-amber-100/70 px-2.5 py-1.5 text-xs dark:bg-zinc-900/70"
  >
    <div class="flex items-center gap-1.5 font-semibold">
      <span
        class="h-2 w-2 rounded-full"
        :class="
          recipe.difficulty === 'Easy'
            ? 'bg-emerald-400'
            : recipe.difficulty === 'Medium'
              ? 'bg-amber-400'
              : 'bg-rose-400'
        "
        aria-hidden="true"
      />
      <span
        :class="
          recipe.difficulty === 'Easy'
            ? 'text-emerald-700 dark:text-emerald-200'
            : recipe.difficulty === 'Medium'
              ? 'text-amber-700 dark:text-amber-200'
              : 'text-rose-700 dark:text-rose-200'
        "
      >
        {{ t(`difficulty.${recipe.difficulty}`, recipe.difficulty) }}
      </span>
    </div>
    <div class="flex items-center gap-1.5 text-amber-900/90 dark:text-amber-100/90">
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2" />
      </svg>
      <span>{{ recipe.cookTimeMinutes }} {{ t("meta.minutes") }}</span>
    </div>
    <div class="flex items-center gap-1.5 text-amber-900/90 dark:text-amber-100/90">
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="2" />
        <path
          d="M5 19a7 7 0 0 1 14 0"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <span>{{ recipe.servings }}</span>
    </div>
  </div>
</template>
