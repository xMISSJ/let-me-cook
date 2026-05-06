<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { fetchRecipeImageFromSpoonacular } from "../data/recipesDb";

const props = defineProps({
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
const detailTab = ref("ingredients");
const fetchedFallbackImageUrl = ref("");
const hasImageLoadError = ref(false);

const detailImageUrl = computed(() => props.recipe.imageUrl || fetchedFallbackImageUrl.value);

watch(
  () => props.recipe?.id,
  async () => {
    fetchedFallbackImageUrl.value = "";
    hasImageLoadError.value = false;
    if (props.recipe?.imageUrl) return;
    fetchedFallbackImageUrl.value = await fetchRecipeImageFromSpoonacular(props.recipe);
  },
  { immediate: true },
);

watch(
  detailImageUrl,
  () => {
    hasImageLoadError.value = false;
  },
);

function handleDetailImageError() {
  hasImageLoadError.value = true;
}
</script>

<template>
  <section class="overflow-hidden bg-white dark:bg-zinc-950">
    <div class="relative">
      <img
        v-if="detailImageUrl && !hasImageLoadError"
        :src="detailImageUrl"
        class="h-64 w-full object-cover sm:h-80"
        alt=""
        @error="handleDetailImageError"
      />
      <div
        v-else
        class="flex h-64 w-full items-center justify-center bg-amber-100 text-7xl sm:h-80 dark:bg-zinc-900"
        aria-hidden="true"
      >
        {{ props.recipe.thumbnail || "🍽️" }}
      </div>
      <div class="absolute left-3 right-3 top-3 flex items-center justify-between">
        <button
          class="inline-flex items-center justify-center rounded-xl bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
          type="button"
          @click="emit('back')"
        >
          ← {{ t("details.backToRecipes") }}
        </button>
        <div v-if="canManage" class="flex items-center gap-2">
          <button
            class="inline-flex items-center justify-center rounded-xl bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
            type="button"
            @click="emit('edit')"
          >
            {{ t("details.editRecipe") }}
          </button>
          <button
            class="inline-flex items-center justify-center rounded-xl bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
            type="button"
            @click="emit('delete')"
          >
            {{ t("details.deleteRecipe") }}
          </button>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5">
      <h2 class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{{ props.recipe.title }}</h2>
      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        <span>Prep: {{ props.recipe.cookTimeMinutes }}m</span>
        <span>Cook: {{ props.recipe.cookTimeMinutes }}m</span>
        <span>Total: {{ props.recipe.cookTimeMinutes * 2 }}m</span>
      </div>
      <p class="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{{ props.recipe.description }}</p>

      <div class="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
        <button
          class="rounded-lg px-2 py-2 text-sm font-semibold transition"
          :class="
            detailTab === 'ingredients'
              ? 'bg-white text-zinc-950 shadow dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          "
          type="button"
          @click="detailTab = 'ingredients'"
        >
          {{ t("details.ingredients") }}
        </button>
        <button
          class="rounded-lg px-2 py-2 text-sm font-semibold transition"
          :class="
            detailTab === 'instructions'
              ? 'bg-white text-zinc-950 shadow dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          "
          type="button"
          @click="detailTab = 'instructions'"
        >
          {{ t("details.steps") }}
        </button>
        <button
          class="rounded-lg px-2 py-2 text-sm font-semibold transition"
          :class="
            detailTab === 'nutrition'
              ? 'bg-white text-zinc-950 shadow dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          "
          type="button"
          @click="detailTab = 'nutrition'"
        >
          Nutrition
        </button>
      </div>

      <section v-if="detailTab === 'ingredients'" class="mt-4">
        <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ t("details.ingredients") }}</h3>
        <ul class="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li
            v-for="item in props.recipe.ingredients"
            :key="item"
            class="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {{ item }}
          </li>
        </ul>
      </section>

      <section v-else-if="detailTab === 'instructions'" class="mt-4">
        <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ t("details.steps") }}</h3>
        <ol class="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li
            v-for="(item, index) in props.recipe.steps"
            :key="item"
            class="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span class="mr-2 font-semibold text-zinc-900 dark:text-zinc-100">{{ index + 1 }}.</span>{{ item }}
          </li>
        </ol>
      </section>

      <section v-else class="mt-4">
        <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Nutrition</h3>
        <p class="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Nutrition info is not available yet for this recipe.
        </p>
      </section>
    </div>
  </section>
</template>
