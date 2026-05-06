<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  fetchRecipeImageFromSpoonacular,
  getRecipeImageDetailUrl,
  getRecipeImageThumbnailUrl,
} from "../data/recipesDb";

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
  canManage: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "edit", "delete", "toggle-favorite"]);
const { t } = useI18n();
const detailTab = ref("ingredients");
const fetchedFallbackImageUrl = ref("");
const hasImageLoadError = ref(false);
const isDetailImageLoaded = ref(false);

const detailImageUrl = computed(() => getRecipeImageDetailUrl(props.recipe.imageUrl || fetchedFallbackImageUrl.value));
const detailThumbUrl = computed(() => getRecipeImageThumbnailUrl(props.recipe.imageUrl || fetchedFallbackImageUrl.value));

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
    isDetailImageLoaded.value = false;
  },
);

function handleDetailImageLoad() {
  isDetailImageLoaded.value = true;
}

function handleDetailImageError() {
  hasImageLoadError.value = true;
  isDetailImageLoaded.value = false;
}

function getMealTypeEmoji(recipe) {
  const mealType = String(recipe?.mealType ?? "").toLowerCase();
  if (mealType === "breakfast") return "🍳";
  if (mealType === "lunch") return "🥪";
  if (mealType === "dinner") return "🍽️";
  if (mealType === "snack") return "🍿";
  if (mealType === "dessert") return "🍰";
  return "🍽️";
}
</script>

<template>
  <section class="overflow-hidden bg-white dark:bg-zinc-950">
    <div class="relative">
      <div
        v-if="detailImageUrl && !hasImageLoadError"
        class="relative h-64 w-full overflow-hidden sm:h-80"
      >
        <div
          v-if="!isDetailImageLoaded"
          class="absolute inset-0 animate-pulse bg-gradient-to-br from-amber-200/70 via-amber-100/60 to-amber-300/50 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800"
        />
        <img
          :src="detailImageUrl"
          class="h-full w-full object-cover transition-opacity duration-300"
          :class="isDetailImageLoaded ? 'opacity-100' : 'opacity-0'"
          alt=""
          @load="handleDetailImageLoad"
          @error="handleDetailImageError"
        />
      </div>
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
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-sm lg:hidden"
            :class="
              isFavorite
                ? 'bg-rose-500/85 text-white hover:bg-rose-500'
                : 'bg-black/60 text-white hover:bg-black/70'
            "
            type="button"
            @click="emit('toggle-favorite')"
          >
            <svg viewBox="0 0 512 512" class="mr-1.5 h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M256 436a54.62 54.62 0 0 1-29.53-8.64c-25-16.07-73.08-49.05-113.75-89.32C62.81 288.58 37.5 242 37.5 199.56c0-29.49 8.72-56.51 25.22-78.13a115.2 115.2 0 0 1 137.89-35.75c21.18 9.14 40.07 24.55 55.39 45 15.32-20.5 34.21-35.91 55.39-45a115.2 115.2 0 0 1 137.89 35.75c16.5 21.62 25.22 48.64 25.22 78.13 0 42.44-25.31 89-75.22 138.44-40.67 40.27-88.73 73.25-113.75 89.32A54.62 54.62 0 0 1 256 436zM154.16 101.06a89.41 89.41 0 0 0-23.42 3.1 90.93 90.93 0 0 0-48.15 32.44c-13.14 17.22-20.09 39-20.09 63 0 35.52 22.81 76.12 67.81 120.68 39 38.66 85.47 70.5 109.67 86a29.72 29.72 0 0 0 32 0c24.2-15.54 70.63-47.38 109.67-86 45-44.56 67.81-85.16 67.81-120.68 0-24-6.95-45.74-20.09-63a90.93 90.93 0 0 0-48.15-32.44c-34.17-9.28-82.18.42-114.48 55.48a12.49 12.49 0 0 1-21.56 0c-25.38-43.34-60.54-58.58-91.02-58.58z"
                :fill="isFavorite ? 'currentColor' : 'transparent'"
                stroke="currentColor"
                :stroke-width="isFavorite ? 20 : 26"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ isFavorite ? "Favorited" : "Favorite" }}
          </button>
          <button
            class="hidden h-9 w-9 items-center justify-center rounded-lg backdrop-blur-sm lg:inline-flex"
            :class="
              isFavorite
                ? 'bg-rose-500/85 text-white hover:bg-rose-500'
                : 'bg-black/65 text-white hover:bg-black/75'
            "
            type="button"
            :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
            :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
            @click="emit('toggle-favorite')"
          >
            <svg viewBox="0 0 512 512" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M256 436a54.62 54.62 0 0 1-29.53-8.64c-25-16.07-73.08-49.05-113.75-89.32C62.81 288.58 37.5 242 37.5 199.56c0-29.49 8.72-56.51 25.22-78.13a115.2 115.2 0 0 1 137.89-35.75c21.18 9.14 40.07 24.55 55.39 45 15.32-20.5 34.21-35.91 55.39-45a115.2 115.2 0 0 1 137.89 35.75c16.5 21.62 25.22 48.64 25.22 78.13 0 42.44-25.31 89-75.22 138.44-40.67 40.27-88.73 73.25-113.75 89.32A54.62 54.62 0 0 1 256 436zM154.16 101.06a89.41 89.41 0 0 0-23.42 3.1 90.93 90.93 0 0 0-48.15 32.44c-13.14 17.22-20.09 39-20.09 63 0 35.52 22.81 76.12 67.81 120.68 39 38.66 85.47 70.5 109.67 86a29.72 29.72 0 0 0 32 0c24.2-15.54 70.63-47.38 109.67-86 45-44.56 67.81-85.16 67.81-120.68 0-24-6.95-45.74-20.09-63a90.93 90.93 0 0 0-48.15-32.44c-34.17-9.28-82.18.42-114.48 55.48a12.49 12.49 0 0 1-21.56 0c-25.38-43.34-60.54-58.58-91.02-58.58z"
                :fill="isFavorite ? 'currentColor' : 'transparent'"
                stroke="currentColor"
                :stroke-width="isFavorite ? 20 : 26"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <template v-if="canManage">
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
          </template>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5">
      <div class="flex items-start gap-3">
        <div class="min-w-0">
          <h2 class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{{ props.recipe.title }}</h2>
          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <span>Prep: {{ props.recipe.cookTimeMinutes }}m</span>
            <span>Cook: {{ props.recipe.cookTimeMinutes }}m</span>
            <span>Total: {{ props.recipe.cookTimeMinutes * 2 }}m</span>
          </div>
        </div>
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
