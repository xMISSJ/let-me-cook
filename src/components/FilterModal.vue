<template>
  <Transition
    enter-active-class="transition-opacity duration-250 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="isOpen"
      class="fixed inset-0 z-50 bg-black/70 p-4 md:flex md:items-center md:justify-center"
      @click.self="emit('close')"
    >
      <Transition
        enter-active-class="transition-transform duration-320 ease-out md:transition-opacity md:duration-200"
        enter-from-class="translate-y-full md:translate-y-0 md:opacity-0"
        enter-to-class="translate-y-0 md:opacity-100"
        leave-active-class="transition-transform duration-260 ease-in md:transition-opacity md:duration-180"
        leave-from-class="translate-y-0 md:opacity-100"
        leave-to-class="translate-y-full md:translate-y-0 md:opacity-0"
      >
        <section
          v-show="isOpen"
          class="fixed bottom-0 left-0 right-0 rounded-t-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-xl dark:bg-zinc-900 md:static md:w-full md:max-w-xl md:rounded-2xl"
        >
          <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-amber-500/35 md:hidden" aria-hidden="true" />
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-50">{{ t("filters.title") }}</h2>
        <UButton
          class="cursor-pointer"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="emit('close')"
        >
          {{ t("filters.close") }}
        </UButton>
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            {{ t("filters.cuisine") }}
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="option in cuisineOptions"
              :key="option"
              class="cursor-pointer rounded-full text-sm font-medium transition"
              color="neutral"
              variant="outline"
              :class="
                option === 'All'
                  ? selectedCuisine.length === 0
                  : isCuisineSelected(selectedCuisine, option)
                  ? 'border-amber-300 bg-amber-500/30 text-amber-50'
                  : 'border-amber-500/40 bg-white text-amber-900 hover:border-amber-400/70 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
              "
              @click="toggleCuisine(selectedCuisine, option)"
            >
              {{ formatCuisine(option) }}
            </UButton>
          </div>
        </div>
        <div class="grid gap-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            {{ t("filters.mealType") }}
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="option in mealTypeOptions"
              :key="option"
              class="cursor-pointer rounded-full text-sm font-medium transition"
              color="neutral"
              variant="outline"
              :class="
                option === 'All'
                  ? selectedMealType.length === 0
                  : isMealTypeSelected(selectedMealType, option)
                  ? 'border-amber-300 bg-amber-500/30 text-amber-50'
                  : 'border-amber-500/40 bg-white text-amber-900 hover:border-amber-400/70 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
              "
              @click="toggleMealType(selectedMealType, option)"
            >
              <span v-if="getMealTypeEmoji(option)" class="mr-1.5" aria-hidden="true">{{ getMealTypeEmoji(option) }}</span>
              {{ formatMealType(option) }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <UButton
          class="cursor-pointer"
          color="neutral"
          variant="outline"
          @click="emit('clear')"
        >
          {{ t("filters.clear") }}
        </UButton>
        <UButton
          class="cursor-pointer"
          color="primary"
          @click="emit('apply')"
        >
          {{ t("filters.apply") }}
        </UButton>
      </div>
        </section>
      </Transition>
    </div>
  </Transition>
</template>

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
    type: Array,
    required: true,
  },
  selectedMealType: {
    type: Array,
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

function isCuisineSelected(selectedCuisine, option) {
  return selectedCuisine.includes(option);
}

function isMealTypeSelected(selectedMealType, option) {
  return selectedMealType.includes(option);
}

function toggleCuisine(selectedCuisine, option) {
  if (option === "All") {
    emit("update:selected-cuisine", []);
    return;
  }
  if (selectedCuisine.includes(option)) {
    emit(
      "update:selected-cuisine",
      selectedCuisine.filter((item) => item !== option),
    );
    return;
  }
  emit("update:selected-cuisine", [...selectedCuisine, option]);
}

function toggleMealType(selectedMealType, option) {
  if (option === "All") {
    emit("update:selected-meal-type", []);
    return;
  }
  if (selectedMealType.includes(option)) {
    emit(
      "update:selected-meal-type",
      selectedMealType.filter((item) => item !== option),
    );
    return;
  }
  emit("update:selected-meal-type", [...selectedMealType, option]);
}

function formatCuisine(option) {
  if (option === "All") return t("filters.all");
  return t(`cuisine.${option}`, option);
}

function formatMealType(option) {
  if (option === "All") return t("filters.all");
  return t(`mealType.${option}`, option);
}

function getMealTypeEmoji(option) {
  const mealType = String(option ?? "").toLowerCase();
  if (mealType === "breakfast") return "🍳";
  if (mealType === "lunch") return "🥪";
  if (mealType === "dinner") return "🍽️";
  if (mealType === "snack") return "🍿";
  if (mealType === "dessert") return "🍰";
  return "";
}
</script>
