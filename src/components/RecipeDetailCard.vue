<template>
  <section
    class="overflow-hidden bg-white dark:bg-zinc-950 xl:mx-auto xl:my-8 xl:max-w-6xl xl:rounded-3xl xl:border xl:border-amber-500/25 xl:bg-amber-50/85 xl:shadow-[0_28px_70px_-38px_rgba(120,53,15,0.55)] dark:xl:border-amber-300/20 dark:xl:bg-zinc-900"
  >
    <div class="relative">
      <div
        v-if="detailImageUrl && !hasImageLoadError"
        class="relative h-64 w-full overflow-hidden sm:h-80 xl:h-100"
      >
        <div
          v-if="!isDetailImageLoaded"
          class="absolute inset-0 animate-pulse bg-linear-to-br from-amber-200/70 via-amber-100/60 to-amber-300/50 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800"
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
        class="flex h-64 w-full items-center justify-center bg-amber-100 text-7xl sm:h-80 xl:h-100 dark:bg-zinc-900"
        aria-hidden="true"
      >
        {{ props.recipe.thumbnail || "🍽️" }}
      </div>
      <div class="absolute left-3 right-3 top-3 flex items-center justify-between xl:left-5 xl:right-5 xl:top-5">
        <button
          class="inline-flex h-8 items-center justify-center rounded-lg bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
          type="button"
          :aria-label="t('details.backToRecipes')"
          :title="t('details.backToRecipes')"
          @click="emit('back')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            class="h-3.5 w-3.5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M411.5 281h-298c-13.81 0-25-11.19-25-25s11.19-25 25-25h298c13.81 0 25 11.19 25 25s-11.19 25-25 25z" />
            <path d="M227.99 399.25c-6.08 0-12.18-2.21-16.99-6.67L83.5 274.33a25 25 0 0 1 .25-36.89l131-118.25c10.25-9.25 26.06-8.44 35.31 1.81s8.44 26.06-1.81 35.31l-110.72 99.94L245 355.92c10.12 9.39 10.72 25.21 1.33 35.33-4.93 5.31-11.62 8-18.34 8z" />
          </svg>
          <span class="ml-1.5 hidden sm:inline">{{ t("details.backToRecipes") }}</span>
        </button>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center justify-center rounded-xl bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65 lg:hidden"
            type="button"
            :aria-label="isFavorite ? t('favorites.removeAria') : t('favorites.addAria')"
            @click="emit('toggle-favorite')"
          >
            <svg viewBox="-24 -24 560 560" class="mr-1.5 h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                v-if="isFavorite"
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
            {{ isFavorite ? t("favorites.favorited") : t("favorites.favorite") }}
          </button>
          <button
            class="hidden h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm hover:bg-black/65 lg:inline-flex"
            type="button"
            :aria-label="isFavorite ? t('favorites.removeAria') : t('favorites.addAria')"
            :title="isFavorite ? t('favorites.removeAria') : t('favorites.addAria')"
            @click="emit('toggle-favorite')"
          >
            <svg viewBox="-24 -24 560 560" class="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                v-if="isFavorite"
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
          <template v-if="canManage">
            <button
              class="inline-flex h-8 items-center justify-center rounded-lg bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
              type="button"
              @click="emit('edit')"
            >
              {{ t("details.editRecipe") }}
            </button>
            <button
              class="inline-flex h-8 items-center justify-center rounded-lg bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
              type="button"
              @click="emit('delete')"
            >
              {{ t("details.deleteRecipe") }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5 xl:px-8 xl:py-8">
      <div class="flex items-start gap-3">
        <div class="min-w-0">
          <h2 class="text-3xl font-black tracking-tight text-zinc-900 xl:text-4xl dark:text-zinc-50">{{ props.recipe.title }}</h2>
          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <span>{{ t("details.prepTime", { minutes: props.recipe.cookTimeMinutes }) }}</span>
            <span>{{ t("details.cookTime", { minutes: props.recipe.cookTimeMinutes }) }}</span>
            <span>{{ t("details.totalTime", { minutes: props.recipe.cookTimeMinutes * 2 }) }}</span>
          </div>
        </div>
      </div>
      <p class="mt-2 text-sm text-zinc-700 xl:mt-3 xl:text-base dark:text-zinc-300">{{ props.recipe.description }}</p>

      <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start xl:gap-7">
        <div>
          <div
            class="relative grid rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900"
            :style="{ gridTemplateColumns: `repeat(${detailTabs.length}, minmax(0, 1fr))` }"
          >
            <span
              class="pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-zinc-800"
              :style="{ width: `calc((100% - 0.5rem) / ${detailTabs.length})`, transform: `translateX(${activeDetailTabIndex * 100}%)` }"
              aria-hidden="true"
            />
            <button
              v-for="tab in detailTabs"
              :key="tab.key"
              class="relative z-10 rounded-lg px-2 py-2 text-sm font-semibold transition-colors duration-200 ease-out"
              :class="detailTab === tab.key ? 'text-zinc-950 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'"
              type="button"
              @click="detailTab = tab.key"
            >
              {{ tab.label }}
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
            <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ t("details.nutrition") }}</h3>
            <p class="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {{ t("details.nutritionUnavailable") }}
            </p>
          </section>
        </div>

        <aside
          class="hidden rounded-2xl border border-amber-500/25 bg-white/90 p-4 shadow-[0_14px_32px_-28px_rgba(120,53,15,0.55)] xl:grid xl:gap-3 dark:border-amber-300/20 dark:bg-zinc-900/70"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{{ t("details.snapshot") }}</p>
          <div class="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <p class="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ t("details.typeLabel") }}</span>
              {{ getMealTypeEmoji(props.recipe) }} {{ props.recipe.mealType || t("details.mealFallback") }}
            </p>
            <p class="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ t("details.cuisineLabel") }}</span>
              {{ props.recipe.cuisine || t("details.globalFallback") }}
            </p>
            <p class="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ t("details.servingsLabel") }}</span>
              {{ props.recipe.servings || t("details.na") }}
            </p>
            <p class="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ t("details.cookTimeLabel") }}</span>
              {{ t("details.minutesCount", { minutes: props.recipe.cookTimeMinutes }) }}
            </p>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

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
const detailTabs = computed(() => [
  { key: "ingredients", label: t("details.ingredients") },
  { key: "instructions", label: t("details.steps") },
  { key: "nutrition", label: t("details.nutrition") },
]);
const activeDetailTabIndex = computed(() => {
  const index = detailTabs.value.findIndex((tab) => tab.key === detailTab.value);
  return index >= 0 ? index : 0;
});

watch(
  () => [props.recipe?.id, props.recipe?.imageUrl ?? ""],
  async () => {
    fetchedFallbackImageUrl.value = "";
    hasImageLoadError.value = false;
    if (!props.recipe?.id || props.recipe?.imageUrl) return;
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
