<script setup>
import RecipeMetaInfo from "./RecipeMetaInfo.vue";
import { useI18n } from "vue-i18n";

defineProps({
  recipes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["select-recipe", "add-recipe"]);
const { t } = useI18n();

function selectRecipe(recipeId) {
  emit("select-recipe", recipeId);
}

function addRecipe() {
  emit("add-recipe");
}
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ t("overview.myRecipes") }}</h2>
        <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          {{ t("overview.helpText") }}
        </p>
      </div>
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        type="button"
        @click="addRecipe"
        :aria-label="t('overview.addRecipe')"
      >
        <span class="flex h-8 w-8 items-center justify-center sm:hidden" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="hidden sm:inline">+ {{ t("overview.addRecipe") }}</span>
      </button>
    </div>

    <div class="mt-4 grid gap-3">
      <button
        v-for="recipe in recipes"
        :key="recipe.id"
        class="cursor-pointer rounded-xl border border-amber-500/30 bg-white p-4 text-left transition hover:border-amber-400/60 hover:bg-amber-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        type="button"
        @click="selectRecipe(recipe.id)"
      >
        <div class="flex items-center gap-3">
          <div
            v-if="recipe.imageUrl"
            class="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-amber-400/40"
          >
            <img :src="recipe.imageUrl" class="h-full w-full object-cover" alt="" />
          </div>
          <div
            v-else
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 text-xl"
            aria-hidden="true"
          >
            {{ recipe.thumbnail || "🍽️" }}
          </div>
          <div>
            <h3 class="font-semibold text-amber-900 dark:text-amber-50">{{ recipe.title }}</h3>
            <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">{{ recipe.description }}</p>
            <div class="mt-2 space-y-1.5">
              <div class="flex flex-wrap gap-2">
                <span
                  class="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-100"
                >
                  {{ t(`cuisine.${recipe.cuisine}`, recipe.cuisine) }}
                </span>
                <span
                  class="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-100"
                >
                  {{ t(`mealType.${recipe.mealType}`, recipe.mealType) }}
                </span>
              </div>
              <RecipeMetaInfo :recipe="recipe" />
            </div>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
