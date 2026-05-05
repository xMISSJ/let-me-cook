<script setup>
import IngredientsCard from "./components/IngredientsCard.vue";
import RecipeHero from "./components/RecipeHero.vue";
import StepsCard from "./components/StepsCard.vue";

const ingredients = [
  "250g spaghetti",
  "3 tbsp olive oil",
  "3 garlic cloves (thinly sliced)",
  "1 lemon (zest + juice)",
  "40g grated parmesan",
  "Salt and black pepper",
  "Handful of chopped parsley",
];

const steps = [
  "Boil spaghetti in salted water until al dente.",
  "Reserve one cup of pasta water and drain the rest.",
  "Warm olive oil in a pan and gently cook garlic for 1 minute.",
  "Add lemon zest, lemon juice, and 1/4 cup pasta water to the pan.",
  "Toss spaghetti into the sauce, then stir in parmesan and parsley.",
  "Season with salt and black pepper. Add extra pasta water if needed.",
];
</script>

<template>
  <main class="min-h-screen bg-amber-50 px-4 py-8 text-amber-950">
    <div class="mx-auto grid w-full max-w-3xl gap-4">
      <RecipeHero />
      <IngredientsCard :ingredients="ingredients" />
      <StepsCard :steps="steps" />
    </div>
  </main>
</template>
