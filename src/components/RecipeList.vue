<template>
  <section
    :class="
      props.embedded
        ? 'px-0 py-0'
        : 'rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900'
    "
  >
    <div v-if="!props.embedded" class="flex items-start justify-between gap-3">
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

    <div :class="props.embedded ? 'grid items-start gap-3 xl:grid-cols-2' : 'mt-4 grid items-start gap-3 xl:grid-cols-2'">
      <section
        v-if="!props.embedded && props.isLoading"
        class="col-span-full rounded-xl border border-amber-500/30 bg-white px-5 py-7 text-center dark:bg-zinc-800"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="inline-flex items-center gap-2.5 text-amber-900/80 dark:text-amber-100/80">
          <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-500 dark:border-amber-300/25 dark:border-t-amber-300" aria-hidden="true" />
          <span class="text-sm font-medium">{{ t("status.loadingRecipes") }}</span>
        </div>
      </section>
      <section
        v-if="!props.embedded && props.showNoResults"
        class="col-span-full rounded-xl border border-amber-500/30 bg-white px-5 py-6 text-center dark:bg-zinc-800"
      >
        <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-50">{{ t("filters.noResultsTitle") }}</h3>
        <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
          {{ t("filters.noResultsHint") }}
        </p>
        <p class="mt-3 text-xs text-amber-900/80 dark:text-amber-100/80">
          {{ t("filters.cuisine") }}: {{ props.noResultsCuisineLabel || t("filters.all") }} ·
          {{ t("filters.mealType") }}: {{ props.noResultsMealTypeLabel || t("filters.all") }}
        </p>
        <button
          class="mt-4 inline-flex items-center justify-center rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-[box-shadow,background-color] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-700 dark:text-amber-100 dark:lg:hover:bg-zinc-600"
          type="button"
          @click="clearFilters"
        >
          {{ t("filters.clear") }}
        </button>
      </section>
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
        <button
          class="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/45 bg-black/55 text-rose-500 transition-[box-shadow,background-color,filter] duration-200 ease-out active:brightness-95 lg:hidden dark:bg-zinc-900/90"
          type="button"
          :aria-label="isFavorite(recipe.id) ? t('favorites.removeAria') : t('favorites.addAria')"
          :title="isFavorite(recipe.id) ? t('favorites.removeAria') : t('favorites.addAria')"
          @click.stop="toggleFavorite(recipe.id)"
        >
          <svg viewBox="0 0 512 512" class="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              v-if="isFavorite(recipe.id)"
              d="M461.2 314c-22.6 27.4-122 109.4-173.7 151.4-18.4 15-44.7 15-63.1 0-51.7-42-151-124-173.7-151.4C16.1 272.3 0 232.6 0 189.4c0-42.2 14.4-81 40.6-109.4C67.2 51.3 103.5 35.4 143 35.4c29.6 0 56.6 9.4 80.4 27.8 12.4 9.7 23.4 21.1 32.5 34 9.2-12.8 20.1-24.3 32.5-34 23.8-18.5 50.9-27.8 80.5-27.8 39.6 0 75.9 15.9 102.4 44.6 26.1 28.4 40.6 67.1 40.6 109.4.1 43.2-16 82.9-50.7 124.6z"
              fill="#f43f5e"
            />
            <path
              v-else
              d="M256 478c-13.3 0-26.3-4.5-36.6-12.9C166 421.6 73.1 344.7 51.1 318.2 16.2 276.1 0 236 0 192c0-43 14.8-82.7 41.7-111.9C69.1 50.4 106.7 34 147.4 34c30.7 0 58.7 9.7 83.4 28.9 9.3 7.1 17.7 15.3 25.1 24.3 7.5-9 15.9-17.1 25.1-24.3C305.8 43.7 333.9 34 364.5 34c40.8 0 78.3 16.4 105.8 46.1C497.2 109.3 512 149 512 192c0 44-16.2 84.1-51.1 126.2-22 26.5-114.9 103.4-168.3 146.8-10.3 8.4-23.3 13-36.6 13zM147.4 54c-34.6-.2-67.7 14.2-91.1 39.7C32.9 119.1 20 154 20 192c0 39.1 14.8 75.2 46.5 113.4 15.3 18.4 75.6 71 165.5 144.1 14 11.3 34 11.3 48 0 89.9-73.1 150.2-125.6 165.5-144.1C477.2 267.2 492 231.1 492 192c0-37.9-12.9-72.8-36.4-98.3-23.4-25.5-56.5-39.9-91.1-39.7-26.1 0-50.1 8.3-71.1 24.7-11.2 8.8-21.1 19.1-29.3 30.6-3.2 4.5-9.5 5.5-14 2.2-.8-.6-1.6-1.4-2.2-2.2-8.2-11.6-18.1-21.8-29.2-30.6C197.5 62.3 173.6 54 147.4 54z"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              stroke-width="20"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="absolute right-2 top-2 z-10 hidden items-center gap-1 lg:flex">
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/45 bg-black/55 text-rose-500 transition-[box-shadow,background-color,filter] duration-200 ease-out lg:hover:bg-black/65 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-900/90 dark:lg:hover:bg-zinc-700"
            type="button"
            :aria-label="isFavorite(recipe.id) ? t('favorites.removeAria') : t('favorites.addAria')"
            :title="isFavorite(recipe.id) ? t('favorites.removeAria') : t('favorites.addAria')"
            @click.stop="toggleFavorite(recipe.id)"
          >
            <svg viewBox="0 0 512 512" class="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                v-if="isFavorite(recipe.id)"
                d="M461.2 314c-22.6 27.4-122 109.4-173.7 151.4-18.4 15-44.7 15-63.1 0-51.7-42-151-124-173.7-151.4C16.1 272.3 0 232.6 0 189.4c0-42.2 14.4-81 40.6-109.4C67.2 51.3 103.5 35.4 143 35.4c29.6 0 56.6 9.4 80.4 27.8 12.4 9.7 23.4 21.1 32.5 34 9.2-12.8 20.1-24.3 32.5-34 23.8-18.5 50.9-27.8 80.5-27.8 39.6 0 75.9 15.9 102.4 44.6 26.1 28.4 40.6 67.1 40.6 109.4.1 43.2-16 82.9-50.7 124.6z"
                fill="#f43f5e"
              />
              <path
                v-else
                d="M256 478c-13.3 0-26.3-4.5-36.6-12.9C166 421.6 73.1 344.7 51.1 318.2 16.2 276.1 0 236 0 192c0-43 14.8-82.7 41.7-111.9C69.1 50.4 106.7 34 147.4 34c30.7 0 58.7 9.7 83.4 28.9 9.3 7.1 17.7 15.3 25.1 24.3 7.5-9 15.9-17.1 25.1-24.3C305.8 43.7 333.9 34 364.5 34c40.8 0 78.3 16.4 105.8 46.1C497.2 109.3 512 149 512 192c0 44-16.2 84.1-51.1 126.2-22 26.5-114.9 103.4-168.3 146.8-10.3 8.4-23.3 13-36.6 13zM147.4 54c-34.6-.2-67.7 14.2-91.1 39.7C32.9 119.1 20 154 20 192c0 39.1 14.8 75.2 46.5 113.4 15.3 18.4 75.6 71 165.5 144.1 14 11.3 34 11.3 48 0 89.9-73.1 150.2-125.6 165.5-144.1C477.2 267.2 492 231.1 492 192c0-37.9-12.9-72.8-36.4-98.3-23.4-25.5-56.5-39.9-91.1-39.7-26.1 0-50.1 8.3-71.1 24.7-11.2 8.8-21.1 19.1-29.3 30.6-3.2 4.5-9.5 5.5-14 2.2-.8-.6-1.6-1.4-2.2-2.2-8.2-11.6-18.1-21.8-29.2-30.6C197.5 62.3 173.6 54 147.4 54z"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                stroke-width="20"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/40 bg-white/90 text-amber-900 transition-[box-shadow,background-color,filter] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-900/90 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            :aria-label="t('details.editRecipe')"
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
            :aria-label="t('details.deleteRecipe')"
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
            <h3 class="min-w-0 break-words text-pretty font-semibold text-amber-900 line-clamp-2 pr-10 dark:text-amber-50 lg:pr-20">{{ recipe.title }}</h3>
            <p class="mt-1 hidden text-xs text-amber-900/75 dark:text-amber-100/75 md:line-clamp-2 md:block">
              {{ recipe.description || t("overview.tapToView") }}
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
  embedded: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  showNoResults: {
    type: Boolean,
    default: false,
  },
  noResultsCuisineLabel: {
    type: String,
    default: "",
  },
  noResultsMealTypeLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["select-recipe", "add-recipe", "edit-recipe", "delete-recipe", "toggle-favorite", "clear-filters"]);
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

function clearFilters() {
  emit("clear-filters");
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
