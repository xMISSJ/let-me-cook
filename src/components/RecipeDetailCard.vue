<script setup>
import RecipeMetaInfo from "./RecipeMetaInfo.vue";
import { useI18n } from "vue-i18n";

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
  canManage: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "edit", "delete"]);
const { t } = useI18n();
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
    <button
      class="cursor-pointer text-sm font-semibold text-amber-700 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
      type="button"
      @click="emit('back')"
    >
      ← {{ t("details.backToRecipes") }}
    </button>
    <div v-if="canManage" class="mt-3 flex gap-2">
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
        type="button"
        @click="emit('edit')"
      >
        {{ t("details.editRecipe") }}
      </button>
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-rose-500/50 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-amber-200 dark:bg-zinc-800 dark:text-rose-200 dark:hover:bg-zinc-700"
        type="button"
        @click="emit('delete')"
      >
        {{ t("details.deleteRecipe") }}
      </button>
    </div>
    <div class="mt-3 flex items-center gap-3">
      <img
        v-if="recipe.imageUrl"
        :src="recipe.imageUrl"
        class="h-16 w-16 rounded-xl border border-amber-400/40 object-cover"
        alt=""
      />
      <div
        v-else
        class="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/20 text-2xl"
        aria-hidden="true"
      >
        {{ recipe.thumbnail }}
      </div>
      <div>
        <h2 class="text-2xl font-bold text-amber-900 dark:text-amber-50">{{ recipe.title }}</h2>
        <p class="mt-1 text-amber-900/85 dark:text-amber-100/85">{{ recipe.description }}</p>
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
  </section>
</template>
