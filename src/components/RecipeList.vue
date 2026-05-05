<script setup>
defineProps({
  recipes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["select-recipe", "add-recipe"]);

function selectRecipe(recipeId) {
  emit("select-recipe", recipeId);
}

function addRecipe() {
  emit("add-recipe");
}
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-amber-50">My Recipes</h2>
        <p class="mt-1 text-sm text-amber-100/85">
          Click a recipe to open ingredients and step-by-step details.
        </p>
      </div>
      <button
        class="cursor-pointer rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        type="button"
        @click="addRecipe"
      >
        + Add Recipe
      </button>
    </div>

    <div class="mt-4 grid gap-3">
      <button
        v-for="recipe in recipes"
        :key="recipe.id"
        class="cursor-pointer rounded-xl border border-amber-500/30 bg-zinc-800 p-4 text-left transition hover:border-amber-400/60 hover:bg-zinc-700"
        type="button"
        @click="selectRecipe(recipe.id)"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 text-xl"
            aria-hidden="true"
          >
            {{ recipe.thumbnail || "🍽️" }}
          </div>
          <div>
            <h3 class="font-semibold text-amber-50">{{ recipe.title }}</h3>
            <p class="mt-1 text-sm text-amber-100/85">{{ recipe.description }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                class="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-100"
              >
                {{ recipe.cuisine }}
              </span>
              <span
                class="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-100"
              >
                {{ recipe.mealType }}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
