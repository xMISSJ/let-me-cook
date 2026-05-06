<script setup>
import RecipeMetaInfo from "./RecipeMetaInfo.vue";
import { useI18n } from "vue-i18n";

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["back"]);
const { t } = useI18n();
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-sm">
    <button
      class="cursor-pointer text-sm font-semibold text-amber-300 hover:text-amber-200"
      type="button"
      @click="emit('back')"
    >
      ← {{ t("details.backToRecipes") }}
    </button>
    <div class="mt-3 flex items-center gap-3">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/20 text-2xl"
        aria-hidden="true"
      >
        {{ recipe.thumbnail }}
      </div>
      <div>
        <h2 class="text-2xl font-bold text-amber-50">{{ recipe.title }}</h2>
        <p class="mt-1 text-amber-100/85">{{ recipe.description }}</p>
        <div class="mt-2 space-y-1.5">
          <div class="flex flex-wrap gap-2">
            <span
              class="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-100"
            >
              {{ t(`cuisine.${recipe.cuisine}`, recipe.cuisine) }}
            </span>
            <span
              class="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-100"
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
