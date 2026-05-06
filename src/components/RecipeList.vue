<script setup>
import { reactive, watch } from "vue";
import RecipeMetaInfo from "./RecipeMetaInfo.vue";
import { useI18n } from "vue-i18n";
import {
  fetchRecipeImageFromSpoonacular,
  getRecipeImageDetailUrl,
  getRecipeImageThumbnailUrl,
} from "../data/recipesDb";

const props = defineProps({
  recipes: {
    type: Array,
    required: true,
  },
  favoriteRecipeIds: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["select-recipe", "add-recipe", "edit-recipe", "delete-recipe", "toggle-favorite"]);
const { t } = useI18n();
const loadedImageKeys = reactive({});
const preloadedDetailImageUrls = reactive({});
const resolvedImageUrls = reactive({});
const pendingFallbackLoads = reactive({});
const mealTypeEmojiLegend = [
  { mealType: "Breakfast", emoji: "🍳" },
  { mealType: "Lunch", emoji: "🥪" },
  { mealType: "Dinner", emoji: "🍽️" },
  { mealType: "Snack", emoji: "🍿" },
  { mealType: "Dessert", emoji: "🍰" },
];

function getImageKey(recipe) {
  return `${recipe.id}-${getEffectiveImageUrl(recipe)}`;
}

function markImageLoaded(recipe) {
  loadedImageKeys[getImageKey(recipe)] = true;
}

function isImageLoaded(recipe) {
  return Boolean(loadedImageKeys[getImageKey(recipe)]);
}

function getEffectiveImageUrl(recipe) {
  return recipe.imageUrl || resolvedImageUrls[String(recipe.id)] || "";
}

function getThumbnailUrl(recipe) {
  return getRecipeImageThumbnailUrl(getEffectiveImageUrl(recipe));
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

function preloadRecipeDetailImage(recipe) {
  const detailUrl = getRecipeImageDetailUrl(getEffectiveImageUrl(recipe));
  if (!detailUrl || preloadedDetailImageUrls[detailUrl]) return;
  preloadedDetailImageUrls[detailUrl] = true;
  const image = new Image();
  image.src = detailUrl;
}

async function ensureFallbackImage(recipe) {
  const recipeId = String(recipe.id);
  if (recipe.imageUrl || resolvedImageUrls[recipeId] || pendingFallbackLoads[recipeId]) return;
  pendingFallbackLoads[recipeId] = true;
  try {
    const fallbackUrl = await fetchRecipeImageFromSpoonacular(recipe);
    if (fallbackUrl) {
      resolvedImageUrls[recipeId] = fallbackUrl;
    }
  } finally {
    delete pendingFallbackLoads[recipeId];
  }
}

watch(
  () => props.recipes.map((recipe) => getImageKey(recipe)),
  (keys) => {
    const activeKeys = new Set(keys);
    Object.keys(loadedImageKeys).forEach((key) => {
      if (!activeKeys.has(key)) {
        delete loadedImageKeys[key];
      }
    });

    const activeIds = new Set(props.recipes.map((recipe) => String(recipe.id)));
    Object.keys(resolvedImageUrls).forEach((id) => {
      if (!activeIds.has(id)) delete resolvedImageUrls[id];
    });

    props.recipes.forEach((recipe) => {
      if (!recipe.imageUrl) {
        void ensureFallbackImage(recipe);
      }
    });
  },
  { immediate: true },
);

function selectRecipe(recipeId) {
  emit("select-recipe", recipeId);
}

function addRecipe() {
  emit("add-recipe");
}

function editRecipe(recipeId) {
  emit("edit-recipe", recipeId);
}

function deleteRecipe(recipeId) {
  emit("delete-recipe", recipeId);
}

function isFavorite(recipeId) {
  return props.favoriteRecipeIds.some((id) => String(id) === String(recipeId));
}

function toggleFavorite(recipeId) {
  emit("toggle-favorite", recipeId);
}

function onCardKeydown(event, recipeId) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectRecipe(recipeId);
  }
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
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="item in mealTypeEmojiLegend"
            :key="item.mealType"
            class="inline-flex items-center gap-1 rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-100"
          >
            <span aria-hidden="true">{{ item.emoji }}</span>
            <span>{{ t(`mealType.${item.mealType}`) }}</span>
          </span>
        </div>
      </div>
      <button
        class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition-[box-shadow,background-color,filter] duration-200 ease-out lg:hover:bg-amber-400 lg:hover:shadow-md active:brightness-95"
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

    <div class="mt-4 grid items-start gap-3 xl:grid-cols-2">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="relative cursor-pointer rounded-xl border border-amber-500/30 bg-white p-4 text-left transition-all duration-300 ease-out lg:hover:border-amber-400/60 lg:hover:bg-amber-200 lg:hover:-translate-y-1 lg:hover:scale-[1.02] lg:hover:shadow-xl lg:hover:shadow-amber-900/10 xl:h-[12.5rem] dark:bg-zinc-800 dark:lg:hover:bg-zinc-700 dark:lg:hover:shadow-black/30"
        role="button"
        tabindex="0"
        @click="selectRecipe(recipe.id)"
        @mouseenter="preloadRecipeDetailImage(recipe)"
        @focusin="preloadRecipeDetailImage(recipe)"
        @keydown="onCardKeydown($event, recipe.id)"
      >
        <div class="absolute right-2 top-2 z-10 hidden items-center gap-1 lg:flex">
          <button
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border transition-[box-shadow,background-color,color,filter] duration-200 ease-out active:brightness-95"
            :class="
              isFavorite(recipe.id)
                ? 'border-rose-500/70 bg-rose-100 text-rose-700 lg:hover:bg-rose-200 lg:hover:shadow-sm dark:border-rose-300/70 dark:bg-rose-400/20 dark:text-rose-200 dark:lg:hover:bg-rose-400/30'
                : 'border-rose-500/60 bg-rose-50/95 text-rose-700 lg:hover:bg-rose-100 lg:hover:shadow-sm dark:border-rose-300/55 dark:bg-zinc-900/95 dark:text-rose-200 dark:lg:hover:bg-zinc-700'
            "
            type="button"
            :aria-label="isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'"
            :title="isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'"
            @click.stop="toggleFavorite(recipe.id)"
          >
            <svg viewBox="0 0 512 512" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M256 436a54.62 54.62 0 0 1-29.53-8.64c-25-16.07-73.08-49.05-113.75-89.32C62.81 288.58 37.5 242 37.5 199.56c0-29.49 8.72-56.51 25.22-78.13a115.2 115.2 0 0 1 137.89-35.75c21.18 9.14 40.07 24.55 55.39 45 15.32-20.5 34.21-35.91 55.39-45a115.2 115.2 0 0 1 137.89 35.75c16.5 21.62 25.22 48.64 25.22 78.13 0 42.44-25.31 89-75.22 138.44-40.67 40.27-88.73 73.25-113.75 89.32A54.62 54.62 0 0 1 256 436zM154.16 101.06a89.41 89.41 0 0 0-23.42 3.1 90.93 90.93 0 0 0-48.15 32.44c-13.14 17.22-20.09 39-20.09 63 0 35.52 22.81 76.12 67.81 120.68 39 38.66 85.47 70.5 109.67 86a29.72 29.72 0 0 0 32 0c24.2-15.54 70.63-47.38 109.67-86 45-44.56 67.81-85.16 67.81-120.68 0-24-6.95-45.74-20.09-63a90.93 90.93 0 0 0-48.15-32.44c-34.17-9.28-82.18.42-114.48 55.48a12.49 12.49 0 0 1-21.56 0c-25.38-43.34-60.54-58.58-91.02-58.58z"
                :fill="isFavorite(recipe.id) ? 'currentColor' : 'transparent'"
                stroke="currentColor"
                :stroke-width="isFavorite(recipe.id) ? 20 : 26"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/40 bg-white/90 text-amber-900 transition-[box-shadow,background-color,filter] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-900/90 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            aria-label="Edit recipe"
            @click.stop="editRecipe(recipe.id)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M12 20h9"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-500/40 bg-white/90 text-rose-700 transition-[box-shadow,background-color,filter] duration-200 ease-out lg:hover:bg-rose-100 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-900/90 dark:text-rose-300 dark:lg:hover:bg-zinc-700"
            type="button"
            aria-label="Delete recipe"
            @click.stop="deleteRecipe(recipe.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 512 512"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <g fill="currentColor">
                <path d="M436 60h-75V45c0-24.813-20.187-45-45-45H196c-24.813 0-45 20.187-45 45v15H76c-24.813 0-45 20.187-45 45 0 19.928 13.025 36.861 31.005 42.761L88.76 470.736C90.687 493.875 110.385 512 133.604 512h244.792c23.22 0 42.918-18.125 44.846-41.271l26.753-322.969C467.975 141.861 481 124.928 481 105c0-24.813-20.187-45-45-45zM181 45c0-8.271 6.729-15 15-15h120c8.271 0 15 6.729 15 15v15H181V45zm212.344 423.246c-.643 7.712-7.208 13.754-14.948 13.754H133.604c-7.739 0-14.305-6.042-14.946-13.747L92.294 150h327.412l-26.362 318.246zM436 120H76c-8.271 0-15-6.729-15-15s6.729-15 15-15h360c8.271 0 15 6.729 15 15s-6.729 15-15 15z" />
                <path d="m195.971 436.071-15-242c-.513-8.269-7.67-14.558-15.899-14.043-8.269.513-14.556 7.631-14.044 15.899l15 242.001c.493 7.953 7.097 14.072 14.957 14.072 8.687 0 15.519-7.316 14.986-15.929zM256 180c-8.284 0-15 6.716-15 15v242c0 8.284 6.716 15 15 15s15-6.716 15-15V195c0-8.284-6.716-15-15-15zM346.927 180.029c-8.25-.513-15.387 5.774-15.899 14.043l-15 242c-.511 8.268 5.776 15.386 14.044 15.899 8.273.512 15.387-5.778 15.899-14.043l15-242c.512-8.269-5.775-15.387-14.044-15.899z" />
              </g>
            </svg>
          </button>
        </div>
        <div class="flex h-full items-center gap-3">
          <div
            v-if="getEffectiveImageUrl(recipe)"
            class="relative h-28 w-28 shrink-0"
          >
            <div class="h-full w-full overflow-hidden rounded-lg border border-amber-400/40">
              <div
                v-if="!isImageLoaded(recipe)"
                class="h-full w-full animate-pulse bg-gradient-to-br from-amber-300/40 to-amber-500/20 dark:from-zinc-700 dark:to-zinc-600"
              />
              <img
                :src="getThumbnailUrl(recipe)"
                class="h-full w-full object-cover transition-opacity duration-300"
                :class="isImageLoaded(recipe) ? 'opacity-100' : 'opacity-0'"
                alt=""
                @load="markImageLoaded(recipe)"
                @error="markImageLoaded(recipe)"
              />
            </div>
            <span
              class="pointer-events-none absolute bottom-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-base shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90"
              aria-hidden="true"
            >
              <span class="leading-none translate-y-[-0.5px]">{{ getMealTypeEmoji(recipe) }}</span>
            </span>
          </div>
          <div
            v-else
            class="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 text-5xl"
            aria-hidden="true"
          >
            {{ recipe.thumbnail || "🍽️" }}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="min-w-0 break-words text-pretty font-semibold text-amber-900 line-clamp-2 dark:text-amber-50 lg:pr-20">{{ recipe.title }}</h3>
            <p class="mt-1 hidden text-xs text-amber-900/75 dark:text-amber-100/75 md:line-clamp-2 md:block">
              {{ recipe.description || "Tap to view ingredients and steps." }}
            </p>
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
      </div>
    </div>
  </section>
</template>
