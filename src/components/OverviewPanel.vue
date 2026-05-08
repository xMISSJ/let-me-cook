<template>
  <section class="grid gap-4">
    <OverviewToolbar
      :filtered-count="filteredRecipes.length"
      :total-count="recipes.length"
      @edit-filters="$emit('open-filter-modal')"
    />
    <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <div class="min-w-0 grid gap-4">
        <RecipeList
          :recipes="filteredRecipes"
          :favorite-recipe-ids="favoriteRecipeIds"
          :is-loading="isLoadingRecipes"
          :show-no-results="!isLoadingRecipes && recipes.length > 0 && filteredRecipes.length === 0 && hasActiveFilters"
          :no-results-cuisine-label="selectedCuisineLabels.length === 0 ? t('filters.all') : selectedCuisineLabels.join(', ')"
          :no-results-meal-type-label="selectedMealTypeLabels.length === 0 ? t('filters.all') : selectedMealTypeLabels.join(', ')"
          @select-recipe="$emit('open-recipe', $event)"
          @add-recipe="$emit('open-add-recipe-modal')"
          @edit-recipe="$emit('open-edit-recipe-modal-by-id', $event)"
          @delete-recipe="$emit('remove-recipe-by-id', $event)"
          @toggle-favorite="$emit('toggle-favorite-recipe', $event)"
          @clear-filters="$emit('clear-filters')"
        />
      </div>

      <aside class="hidden min-w-0 h-fit rounded-2xl border border-amber-500/30 bg-white p-4 shadow-sm md:grid md:gap-4 dark:bg-zinc-900">
        <section class="grid gap-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-900/75 dark:text-amber-100/75">{{ t("overview.panelTitle") }}</h3>
        </section>

        <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
          {{ t("overview.showing", { filtered: filteredRecipes.length, total: recipes.length }) }}
        </p>

        <section class="grid gap-2 rounded-xl border border-amber-500/30 bg-white p-3 dark:bg-zinc-800">
          <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-50">{{ t("overview.activeFiltersTitle") }}</h3>
          <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
            {{ t("filters.cuisine") }}:
            <span class="font-semibold">{{ selectedCuisineLabels.length === 0 ? t("filters.all") : selectedCuisineLabels.join(", ") }}</span>
          </p>
          <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
            {{ t("filters.mealType") }}:
            <span class="font-semibold">{{ selectedMealTypeLabels.length === 0 ? t("filters.all") : selectedMealTypeLabels.join(", ") }}</span>
          </p>
          <button
            class="mt-1 inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-[box-shadow,background-color] duration-200 ease-out lg:hover:bg-zinc-200 lg:hover:shadow-md active:brightness-95 dark:bg-zinc-700 dark:text-amber-100 dark:lg:hover:bg-zinc-600"
            type="button"
            @click="$emit('open-filter-modal')"
          >
            {{ t("overview.editFilters") }}
          </button>
        </section>

        <section class="grid gap-3 rounded-xl border border-amber-500/30 bg-white p-3 dark:bg-zinc-800">
          <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-50">{{ t("overview.recentPicksTitle") }}</h3>
          <p v-if="recentRecipes.length === 0" class="text-xs text-amber-900/75 dark:text-amber-100/75">
            {{ t("overview.recentPicksEmpty") }}
          </p>
          <button
            v-for="recipe in recentRecipes"
            :key="recipe.id"
            class="group min-w-0 grid cursor-pointer gap-2 rounded-lg border border-amber-500/30 bg-white/70 px-3 py-2.5 text-left transition-[box-shadow,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hover:border-amber-400/70 lg:hover:bg-zinc-200 lg:hover:shadow-sm lg:hover:shadow-amber-900/10 dark:bg-zinc-800/70 dark:focus-visible:ring-amber-300/60 dark:focus-visible:ring-offset-zinc-800 dark:lg:hover:border-amber-300/50 dark:lg:hover:bg-zinc-700 dark:lg:hover:shadow-black/25"
            type="button"
            @click="$emit('open-recipe', recipe.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-semibold leading-snug wrap-break-word text-amber-900 dark:text-amber-50">
                  {{ recipe.title }}
                </p>
                <div class="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-medium text-amber-900/80 dark:text-amber-100/80">
                  <span class="-ml-px rounded-md bg-zinc-200/85 px-2 py-0.5 transition-colors duration-200 ease-out group-hover:bg-zinc-300 dark:bg-zinc-700 dark:group-hover:bg-zinc-600">
                    {{ t(`cuisine.${recipe.cuisine}`, recipe.cuisine) }}
                  </span>
                  <span class="rounded-md bg-zinc-200/85 px-2 py-0.5 transition-colors duration-200 ease-out group-hover:bg-zinc-300 dark:bg-zinc-700 dark:group-hover:bg-zinc-600">
                    {{ t(`mealType.${recipe.mealType}`, recipe.mealType) }}
                  </span>
                </div>
              </div>
              <span class="shrink-0 text-base opacity-80">{{ recipe.thumbnail || "🍽️" }}</span>
            </div>

            <div class="flex items-center justify-between gap-3 text-[11px] text-amber-900/80 dark:text-amber-100/80">
              <span class="inline-flex items-center gap-1 font-semibold text-amber-900/75 dark:text-amber-100/75">
                {{ t("common.open") }}
                <span class="inline-block transition-transform duration-200 ease-out lg:group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </span>
              <div class="flex items-center gap-3">
                <span>{{ recipe.cookTimeMinutes }} min</span>
                <span>{{ t("common.servingsCount", { count: recipe.servings }) }}</span>
              </div>
            </div>
          </button>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import OverviewToolbar from "./OverviewToolbar.vue";
import RecipeList from "./RecipeList.vue";

defineProps({
  filteredRecipes: { type: Array, required: true },
  recipes: { type: Array, required: true },
  favoriteRecipeIds: { type: Array, required: true },
  isLoadingRecipes: { type: Boolean, required: true },
  hasActiveFilters: { type: Boolean, required: true },
  selectedCuisineLabels: { type: Array, required: true },
  selectedMealTypeLabels: { type: Array, required: true },
  recentRecipes: { type: Array, required: true },
});

defineEmits([
  "open-filter-modal",
  "open-recipe",
  "open-add-recipe-modal",
  "open-edit-recipe-modal-by-id",
  "remove-recipe-by-id",
  "toggle-favorite-recipe",
  "clear-filters",
]);

const { t } = useI18n();
</script>
