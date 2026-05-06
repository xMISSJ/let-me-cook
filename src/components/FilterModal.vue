<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  cuisineOptions: {
    type: Array,
    required: true,
  },
  mealTypeOptions: {
    type: Array,
    required: true,
  },
  selectedCuisine: {
    type: String,
    required: true,
  },
  selectedMealType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "clear",
  "apply",
  "update:selected-cuisine",
  "update:selected-meal-type",
]);

const { t } = useI18n();

function formatCuisine(option) {
  if (option === "All") return t("filters.all");
  return t(`cuisine.${option}`, option);
}

function formatMealType(option) {
  if (option === "All") return t("filters.all");
  return t(`mealType.${option}`, option);
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black/70 p-4 md:flex md:items-center md:justify-center"
    @click.self="emit('close')"
  >
    <section
      class="fixed bottom-0 left-0 right-0 rounded-t-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-xl dark:bg-zinc-900 md:static md:w-full md:max-w-xl md:rounded-2xl"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-50">{{ t("filters.title") }}</h2>
        <button
          class="inline-flex items-center justify-center cursor-pointer rounded-md px-2 py-1 text-sm text-amber-700 hover:bg-amber-200 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-zinc-800 dark:hover:text-amber-100"
          type="button"
          @click="emit('close')"
        >
          {{ t("filters.close") }}
        </button>
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            {{ t("filters.cuisine") }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in cuisineOptions"
              :key="option"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition"
              :class="
                selectedCuisine === option
                  ? 'border-amber-300 bg-amber-500/30 text-amber-50'
                  : 'border-amber-500/40 bg-white text-amber-900 hover:border-amber-400/70 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
              "
              type="button"
              @click="emit('update:selected-cuisine', option)"
            >
              {{ formatCuisine(option) }}
            </button>
          </div>
        </div>
        <div class="grid gap-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            {{ t("filters.mealType") }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in mealTypeOptions"
              :key="option"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition"
              :class="
                selectedMealType === option
                  ? 'border-amber-300 bg-amber-500/30 text-amber-50'
                  : 'border-amber-500/40 bg-white text-amber-900 hover:border-amber-400/70 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
              "
              type="button"
              @click="emit('update:selected-meal-type', option)"
            >
              {{ formatMealType(option) }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <button
          class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
          type="button"
          @click="emit('clear')"
        >
          {{ t("filters.clear") }}
        </button>
        <button
          class="inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          type="button"
          @click="emit('apply')"
        >
          {{ t("filters.apply") }}
        </button>
      </div>
    </section>
  </div>
</template>
