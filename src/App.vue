<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import AddRecipeForm from "./components/AddRecipeForm.vue";
import AppTabs from "./components/AppTabs.vue";
import FilterModal from "./components/FilterModal.vue";
import IngredientsCard from "./components/IngredientsCard.vue";
import OverviewToolbar from "./components/OverviewToolbar.vue";
import RecipeDetailCard from "./components/RecipeDetailCard.vue";
import RecipeHero from "./components/RecipeHero.vue";
import RecipeList from "./components/RecipeList.vue";
import StepsCard from "./components/StepsCard.vue";
import { seedRecipes } from "./data/seedRecipes";

const { t, locale } = useI18n();
const recipes = ref([...seedRecipes]);

const selectedRecipeId = ref(null);
const nextRecipeId = ref(4);
const activeTab = ref("overview");
const isAddModalOpen = ref(false);
const isFilterModalOpen = ref(false);
const selectedCuisine = ref("All");
const selectedMealType = ref("All");

const selectedRecipe = computed(() =>
  recipes.value.find((recipe) => recipe.id === selectedRecipeId.value),
);
const cuisineOptions = computed(() => [
  "All",
  ...new Set(recipes.value.map((recipe) => recipe.cuisine)),
]);
const mealTypeOptions = computed(() => [
  "All",
  ...new Set(recipes.value.map((recipe) => recipe.mealType)),
]);
const filteredRecipes = computed(() =>
  recipes.value.filter((recipe) => {
    const cuisineMatch =
      selectedCuisine.value === "All" || recipe.cuisine === selectedCuisine.value;
    const mealTypeMatch =
      selectedMealType.value === "All" || recipe.mealType === selectedMealType.value;
    return cuisineMatch && mealTypeMatch;
  }),
);

function openRecipe(recipeId) {
  selectedRecipeId.value = recipeId;
  activeTab.value = "details";
}

function goToOverview() {
  activeTab.value = "overview";
}

function setTab(tab) {
  activeTab.value = tab;
}

function openAddRecipeModal() {
  isAddModalOpen.value = true;
}

function closeAddRecipeModal() {
  isAddModalOpen.value = false;
}

function openFilterModal() {
  isFilterModalOpen.value = true;
}

function closeFilterModal() {
  isFilterModalOpen.value = false;
}

function clearFilters() {
  selectedCuisine.value = "All";
  selectedMealType.value = "All";
}

function addRecipe(recipe) {
  recipes.value.unshift({
    id: nextRecipeId.value++,
    thumbnail: "🍽️",
    ...recipe,
  });
  selectedRecipeId.value = recipes.value[0].id;
  activeTab.value = "details";
  closeAddRecipeModal();
}

function applyFilters() {
  closeFilterModal();
}
</script>

<template>
  <main class="min-h-screen bg-zinc-950 px-4 py-8 text-amber-100">
    <div class="mx-auto grid w-full max-w-3xl gap-4">
      <div class="flex justify-end">
        <label class="flex items-center gap-2 text-sm text-amber-100/85">
          <span>{{ t("language") }}</span>
          <select
            v-model="locale"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-2 py-1 text-amber-100 outline-none focus:border-amber-300"
          >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="zh">中文</option>
          </select>
        </label>
      </div>
      <RecipeHero :is-detail-view="activeTab === 'details' && Boolean(selectedRecipe)" />
      <AppTabs :active-tab="activeTab" @change-tab="setTab" />

      <template v-if="activeTab === 'overview'">
        <OverviewToolbar
          :filtered-count="filteredRecipes.length"
          :total-count="recipes.length"
          @edit-filters="openFilterModal"
        />
        <RecipeList
          :recipes="filteredRecipes"
          @select-recipe="openRecipe"
          @add-recipe="openAddRecipeModal"
        />
      </template>

      <template v-else>
        <template v-if="selectedRecipe">
          <RecipeDetailCard :recipe="selectedRecipe" @back="goToOverview" />
          <IngredientsCard :ingredients="selectedRecipe.ingredients" />
          <StepsCard :steps="selectedRecipe.steps" />
        </template>

        <section
          v-else
          class="rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-6 text-center shadow-sm"
        >
          <h2 class="text-xl font-semibold text-amber-50">{{ t("details.noneTitle") }}</h2>
          <p class="mt-2 text-sm text-amber-100/85">
            {{ t("details.noneText") }}
          </p>
          <button
            class="mt-4 cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            type="button"
            @click="setTab('overview')"
          >
            {{ t("details.goToOverview") }}
          </button>
        </section>
      </template>
    </div>

    <FilterModal
      :is-open="isFilterModalOpen"
      :cuisine-options="cuisineOptions"
      :meal-type-options="mealTypeOptions"
      :selected-cuisine="selectedCuisine"
      :selected-meal-type="selectedMealType"
      @close="closeFilterModal"
      @clear="clearFilters"
      @apply="applyFilters"
      @update:selected-cuisine="selectedCuisine = $event"
      @update:selected-meal-type="selectedMealType = $event"
    />

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      @click.self="closeAddRecipeModal"
    >
      <div class="w-full max-w-2xl">
        <AddRecipeForm @add-recipe="addRecipe" @cancel="closeAddRecipeModal" />
      </div>
    </div>
  </main>
</template>
