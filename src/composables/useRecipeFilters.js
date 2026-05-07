import { computed } from "vue";

const DEFAULT_CUISINES = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "French",
  "Thai",
  "Mediterranean",
  "Spanish",
  "Greek",
  "Korean",
  "Middle Eastern",
  "Vietnamese",
  "Turkish",
  "Lebanese",
  "American",
  "International",
];

const DEFAULT_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

function mergeDiscoveredOptions(recipes, fieldName, defaults) {
  const normalizedDefaults = new Map(defaults.map((value) => [value.toLowerCase(), value]));
  const discoveredValues = new Map();

  recipes.forEach((recipe) => {
    const rawValue = String(recipe?.[fieldName] ?? "").trim();
    if (!rawValue) return;
    const lowerValue = rawValue.toLowerCase();
    discoveredValues.set(lowerValue, normalizedDefaults.get(lowerValue) || rawValue);
  });

  return [...defaults, ...[...discoveredValues.values()].filter((value) => !defaults.includes(value))];
}

export function useRecipeFilters({ recipes, selectedCuisine, selectedMealType, t }) {
  const cuisineOptions = computed(() => ["All", ...mergeDiscoveredOptions(recipes.value, "cuisine", DEFAULT_CUISINES)]);

  const mealTypeOptions = computed(() => ["All", ...mergeDiscoveredOptions(recipes.value, "mealType", DEFAULT_MEAL_TYPES)]);

  const filteredRecipes = computed(() =>
    recipes.value.filter((recipe) => {
      const cuisineMatch = selectedCuisine.value.length === 0 || selectedCuisine.value.includes(recipe.cuisine);
      const mealTypeMatch = selectedMealType.value.length === 0 || selectedMealType.value.includes(recipe.mealType);
      return cuisineMatch && mealTypeMatch;
    }),
  );

  const hasActiveFilters = computed(() => selectedCuisine.value.length > 0 || selectedMealType.value.length > 0);

  const selectedCuisineLabels = computed(() => selectedCuisine.value.map((cuisine) => t(`cuisine.${cuisine}`, cuisine)));
  const selectedMealTypeLabels = computed(() =>
    selectedMealType.value.map((mealType) => t(`mealType.${mealType}`, mealType)),
  );

  return {
    cuisineOptions,
    mealTypeOptions,
    filteredRecipes,
    hasActiveFilters,
    selectedCuisineLabels,
    selectedMealTypeLabels,
  };
}
