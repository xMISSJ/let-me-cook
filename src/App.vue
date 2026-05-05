<script setup>
import { computed, ref } from "vue";
import AddRecipeForm from "./components/AddRecipeForm.vue";
import IngredientsCard from "./components/IngredientsCard.vue";
import RecipeHero from "./components/RecipeHero.vue";
import RecipeList from "./components/RecipeList.vue";
import StepsCard from "./components/StepsCard.vue";

const recipes = ref([
  {
    id: 1,
    title: "Weeknight Lemon Garlic Pasta",
    description: "Fresh, simple, and ready in about 20 minutes.",
    thumbnail: "🍝",
    cuisine: "Italian",
    mealType: "Dinner",
    ingredients: [
      "250g spaghetti",
      "3 tbsp olive oil",
      "3 garlic cloves (thinly sliced)",
      "1 lemon (zest + juice)",
      "40g grated parmesan",
      "Salt and black pepper",
      "Handful of chopped parsley",
    ],
    steps: [
      "Boil spaghetti in salted water until al dente.",
      "Reserve one cup of pasta water and drain the rest.",
      "Warm olive oil in a pan and gently cook garlic for 1 minute.",
      "Add lemon zest, lemon juice, and 1/4 cup pasta water to the pan.",
      "Toss spaghetti into the sauce, then stir in parmesan and parsley.",
      "Season with salt and black pepper. Add extra pasta water if needed.",
    ],
  },
  {
    id: 2,
    title: "Simple Veggie Omelette",
    description: "A quick protein-packed breakfast you can customize.",
    thumbnail: "🍳",
    cuisine: "International",
    mealType: "Breakfast",
    ingredients: [
      "3 eggs",
      "1 tbsp milk",
      "1 tsp butter",
      "1/4 cup chopped spinach",
      "1/4 cup diced tomato",
      "2 tbsp shredded cheese",
      "Salt and pepper",
    ],
    steps: [
      "Whisk eggs, milk, salt, and pepper in a bowl.",
      "Heat butter in a non-stick pan over medium heat.",
      "Add spinach and tomato, and cook for 1 minute.",
      "Pour in egg mixture and cook until mostly set.",
      "Sprinkle cheese, fold the omelette, and cook for 30 seconds more.",
    ],
  },
  {
    id: 3,
    title: "Honey Soy Chicken Bowl",
    description: "Sweet-savory chicken with rice and steamed vegetables.",
    thumbnail: "🍚",
    cuisine: "Chinese",
    mealType: "Lunch",
    ingredients: [
      "2 chicken thighs, sliced",
      "2 tbsp soy sauce",
      "1 tbsp honey",
      "1 tsp sesame oil",
      "1 cup cooked rice",
      "1 cup steamed broccoli",
      "1 tsp sesame seeds",
    ],
    steps: [
      "Mix soy sauce, honey, and sesame oil in a bowl.",
      "Cook chicken in a pan until browned and cooked through.",
      "Pour in the sauce and simmer for 2 minutes.",
      "Serve chicken over rice with broccoli.",
      "Finish with sesame seeds.",
    ],
  },
]);

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
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-4 py-8 text-violet-100">
    <div class="mx-auto grid w-full max-w-3xl gap-4">
      <RecipeHero :is-detail-view="activeTab === 'details' && Boolean(selectedRecipe)" />

      <nav
        class="flex flex-wrap items-center gap-2 rounded-2xl border border-violet-500/30 bg-slate-900 p-3 shadow-sm"
      >
        <button
          class="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
          :class="
            activeTab === 'overview'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-violet-200 hover:bg-slate-700'
          "
          type="button"
          @click="setTab('overview')"
        >
          Overview
        </button>
        <button
          class="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
          :class="
            activeTab === 'details'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-violet-200 hover:bg-slate-700'
          "
          type="button"
          @click="setTab('details')"
        >
          Recipe Details
        </button>
      </nav>

      <template v-if="activeTab === 'overview'">
        <section
          class="flex items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-slate-900 px-5 py-4 shadow-sm"
        >
          <p class="text-sm text-violet-200/90">
            Showing {{ filteredRecipes.length }} of {{ recipes.length }} recipes
          </p>
          <div class="flex items-center gap-2">
            <button
              class="cursor-pointer rounded-lg border border-violet-500/50 bg-slate-800 px-3 py-2 text-sm font-semibold text-violet-200 hover:bg-slate-700"
              type="button"
              @click="openFilterModal"
            >
              Edit Filters
            </button>
          </div>
        </section>
        <RecipeList
          :recipes="filteredRecipes"
          @select-recipe="openRecipe"
          @add-recipe="openAddRecipeModal"
        />
      </template>

      <template v-else>
        <template v-if="selectedRecipe">
          <section
            class="rounded-2xl border border-violet-500/30 bg-slate-900 px-5 py-4 shadow-sm"
          >
            <button
              class="cursor-pointer text-sm font-semibold text-violet-300 hover:text-violet-200"
              type="button"
              @click="goToOverview"
            >
              ← Back to recipes
            </button>
            <div class="mt-3 flex items-center gap-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/20 text-2xl"
                aria-hidden="true"
              >
                {{ selectedRecipe.thumbnail }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-violet-50">
                  {{ selectedRecipe.title }}
                </h2>
                <p class="mt-1 text-violet-200/90">{{ selectedRecipe.description }}</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    class="rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-1 text-xs font-medium text-violet-200"
                  >
                    {{ selectedRecipe.cuisine }}
                  </span>
                  <span
                    class="rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-1 text-xs font-medium text-violet-200"
                  >
                    {{ selectedRecipe.mealType }}
                  </span>
                </div>
              </div>
            </div>
          </section>
          <IngredientsCard :ingredients="selectedRecipe.ingredients" />
          <StepsCard :steps="selectedRecipe.steps" />
        </template>

        <section
          v-else
          class="rounded-2xl border border-violet-500/30 bg-slate-900 px-5 py-6 text-center shadow-sm"
        >
          <h2 class="text-xl font-semibold text-violet-50">No recipe selected yet</h2>
          <p class="mt-2 text-sm text-violet-200/90">
            Open one from the Overview tab to see ingredients and steps.
          </p>
          <button
            class="mt-4 cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
            type="button"
            @click="setTab('overview')"
          >
            Go to Overview
          </button>
        </section>
      </template>
    </div>

    <div
      v-if="isFilterModalOpen"
      class="fixed inset-0 z-50 bg-slate-950/70 p-4 md:flex md:items-center md:justify-center"
      @click.self="closeFilterModal"
    >
      <section
        class="fixed bottom-0 left-0 right-0 rounded-t-2xl border border-violet-500/30 bg-slate-900 px-5 py-4 shadow-xl md:static md:w-full md:max-w-xl md:rounded-2xl"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-violet-50">Filter Recipes</h2>
          <button
            class="cursor-pointer rounded-md px-2 py-1 text-sm text-violet-300 hover:bg-slate-800 hover:text-violet-100"
            type="button"
            @click="closeFilterModal"
          >
            Close
          </button>
        </div>

        <div class="grid gap-4">
          <div class="grid gap-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Cuisine
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in cuisineOptions"
                :key="option"
                class="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition"
                :class="
                  selectedCuisine === option
                    ? 'border-violet-300 bg-violet-500/30 text-violet-50'
                    : 'border-violet-500/40 bg-slate-800 text-violet-200 hover:border-violet-400/70 hover:bg-slate-700'
                "
                type="button"
                @click="selectedCuisine = option"
              >
                {{ option }}
              </button>
            </div>
          </div>
          <div class="grid gap-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Meal Type
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in mealTypeOptions"
                :key="option"
                class="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition"
                :class="
                  selectedMealType === option
                    ? 'border-violet-300 bg-violet-500/30 text-violet-50'
                    : 'border-violet-500/40 bg-slate-800 text-violet-200 hover:border-violet-400/70 hover:bg-slate-700'
                "
                type="button"
                @click="selectedMealType = option"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap justify-end gap-2">
          <button
            class="cursor-pointer rounded-lg border border-violet-500/50 bg-slate-800 px-3 py-2 text-sm font-semibold text-violet-200 hover:bg-slate-700"
            type="button"
            @click="clearFilters"
          >
            Clear Filters
          </button>
          <button
            class="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
            type="button"
            @click="closeFilterModal"
          >
            Apply
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4"
      @click.self="closeAddRecipeModal"
    >
      <div class="w-full max-w-2xl">
        <AddRecipeForm @add-recipe="addRecipe" @cancel="closeAddRecipeModal" />
      </div>
    </div>
  </main>
</template>
