<template>
  <section class="rounded-none border-0 bg-white px-4 py-4 shadow-none dark:bg-zinc-900 sm:rounded-2xl sm:border sm:border-amber-500/30 sm:px-6 sm:py-5 sm:shadow-sm lg:rounded-3xl lg:px-7 lg:py-6">
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">
        {{ props.initialRecipe ? t("addRecipeForm.editTitle") : t("addRecipeForm.title") }}
      </h2>
      <button
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/45 bg-white text-amber-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
        type="button"
        @click="emit('cancel')"
        :aria-label="t('addRecipeForm.cancel')"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4.5 w-4.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
      {{ t("addRecipeForm.subtitle") }}
    </p>

    <div
      v-if="!props.initialRecipe"
      class="mt-4 grid gap-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-50/60 p-3 dark:border-amber-300/25 dark:bg-amber-950/30"
    >
      <p class="text-sm font-semibold text-amber-900/90 dark:text-amber-100/90">
        {{ t("addRecipeForm.importTitle") }}
      </p>
      <p class="text-xs text-amber-900/75 dark:text-amber-100/75">
        {{ t("addRecipeForm.importHint") }}
      </p>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          v-model="importUrl"
          class="min-w-0 flex-1 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
          :placeholder="t('addRecipeForm.importUrlPlaceholder')"
          type="url"
          inputmode="url"
          autocomplete="url"
          :disabled="isImporting"
          @keydown.enter.prevent="handleImportFromUrl"
        />
        <button
          class="inline-flex items-center justify-center rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
          type="button"
          :disabled="isImporting || !importUrl.trim()"
          @click="handleImportFromUrl"
        >
          {{ t("addRecipeForm.importButton") }}
        </button>
      </div>
      <p v-if="importSuccess" class="text-xs font-medium text-emerald-700 dark:text-emerald-300">
        {{ importSuccess }}
      </p>
      <p v-if="importError" class="text-xs font-medium text-rose-600 dark:text-rose-300">
        {{ importError }}
      </p>
    </div>

    <form
      class="relative mt-4 grid gap-3 lg:gap-4"
      :aria-busy="isImporting || undefined"
      @submit.prevent="handleSubmit"
    >
      <input
        v-model="form.title"
        class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
        :placeholder="t('addRecipeForm.recipeTitle')"
        type="text"
      />
      <input
        v-model="form.description"
        class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
        :placeholder="t('addRecipeForm.shortDescription')"
        type="text"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.cuisine") }}</span>
          <USelect
            :model-value="form.cuisine"
            :items="cuisineItems"
            value-key="value"
            :highlight="false"
            class="w-full"
            :ui="{ content: 'z-[80]' }"
            @update:model-value="form.cuisine = $event"
          />
        </div>
        <div class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.mealType") }}</span>
          <USelect
            :model-value="form.mealType"
            :items="mealTypeItems"
            value-key="value"
            :highlight="false"
            class="w-full"
            :ui="{ content: 'z-[80]' }"
            @update:model-value="form.mealType = $event"
          />
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.difficulty") }}</span>
          <USelect
            :model-value="form.difficulty"
            :items="difficultyItems"
            value-key="value"
            :highlight="false"
            class="w-full"
            :ui="{ content: 'z-[80]' }"
            @update:model-value="form.difficulty = $event"
          />
        </div>
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.cookTime") }}</span>
          <input
            v-model.number="form.cookTimeMinutes"
            class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
            inputmode="numeric"
            min="1"
            max="1440"
            placeholder="20"
            type="number"
          />
        </label>
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.servings") }}</span>
          <input
            v-model.number="form.servings"
            class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
            inputmode="numeric"
            min="1"
            max="100"
            placeholder="2"
            type="number"
          />
        </label>
      </div>
      <div class="grid gap-2">
        <p class="text-sm font-semibold text-amber-900/90 dark:text-amber-100/90">{{ t("details.ingredients") }}</p>
        <div class="grid gap-2">
          <div
            v-for="(item, index) in form.ingredientsList"
            :key="`ingredient-${index}`"
            class="grid gap-2 sm:flex sm:items-center"
          >
            <input
              v-model="form.ingredientsList[index]"
              class="min-w-0 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 sm:flex-1 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
              :placeholder="`${t('details.ingredients')} ${index + 1}`"
              type="text"
            />
            <div class="flex gap-2 sm:contents">
              <button
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-amber-500/50 bg-white text-amber-900 hover:bg-zinc-200 sm:h-9 sm:w-9 sm:flex-none dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
                type="button"
                @click="insertIngredientAfter(index)"
                :aria-label="t('addRecipeForm.addIngredientRowAria')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4 shrink-0"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </button>
              <button
                v-if="index > 0"
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-rose-500/40 bg-white text-rose-700 hover:bg-rose-50 sm:h-9 sm:w-9 sm:flex-none dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
                type="button"
                @click="removeIngredient(index)"
                :aria-label="t('addRecipeForm.removeIngredientRowAria')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4 shrink-0"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <p class="text-sm font-semibold text-amber-900/90 dark:text-amber-100/90">{{ t("details.steps") }}</p>
        <div class="grid gap-2">
          <div
            v-for="(item, index) in form.stepsList"
            :key="`step-${index}`"
            class="grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:items-start"
          >
            <span class="shrink-0 self-center text-xs font-semibold text-amber-700 sm:self-auto sm:pt-2 dark:text-amber-300">{{ index + 1 }}.</span>
            <input
              v-model="form.stepsList[index]"
              class="min-w-0 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 sm:flex-1 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
              :placeholder="t('addRecipeForm.stepPlaceholder', { number: index + 1 })"
              type="text"
            />
            <div class="col-start-2 flex gap-2 sm:contents">
              <button
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-amber-500/50 bg-white text-amber-900 hover:bg-zinc-200 sm:h-9 sm:w-9 sm:flex-none dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
                type="button"
                @click="insertStepAfter(index)"
                :aria-label="t('addRecipeForm.addStepRowAria')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4 shrink-0"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </button>
              <button
                v-if="index > 0"
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-rose-500/40 bg-white text-rose-700 hover:bg-rose-50 sm:h-9 sm:w-9 sm:flex-none dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
                type="button"
                @click="removeStep(index)"
                :aria-label="t('addRecipeForm.removeStepRowAria')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4 shrink-0"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
        <label>{{ t("addRecipeForm.image") }}</label>
        <div class="grid gap-2">
          <UFileUpload
            v-model="selectedImage"
            accept="image/png,image/jpeg,image/webp,image/gif"
            :multiple="false"
            :preview="false"
            class="w-full rounded-lg border border-amber-500/40 bg-white px-2.5 py-2 text-sm text-amber-900 dark:bg-zinc-800 dark:text-amber-100"
              @update:model-value="onImageSelected"
          />
          <div class="flex items-center gap-2">
            <span class="min-w-0 flex-1 truncate text-xs text-amber-900/85 dark:text-amber-100/85">
              {{ displayImageName }}
            </span>
            <button
              v-if="hasSelectedOrExistingImage"
              class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-500/45 bg-white text-rose-700 hover:bg-rose-50 dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
              type="button"
              :aria-label="t('addRecipeForm.removeImage')"
              :title="t('addRecipeForm.removeImage')"
              @click="removeSelectedImage"
            >
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <p v-if="error" class="text-sm font-medium text-rose-300">{{ error }}</p>
      <div class="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-amber-500/25 bg-white/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-amber-300/20 dark:bg-zinc-900/95 dark:supports-backdrop-filter:bg-zinc-900/80 sm:static sm:mx-0 sm:justify-end sm:gap-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <button
          class="inline-flex w-full items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 sm:w-auto sm:order-2"
          type="submit"
        >
          {{ props.submitLabel || (props.initialRecipe ? t("addRecipeForm.saveRecipe") : t("addRecipeForm.addRecipe")) }}
        </button>
        <button
          class="inline-flex w-full items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-zinc-200 sm:w-auto sm:order-1 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
          type="button"
          @click="emit('cancel')"
        >
          {{ t("addRecipeForm.cancel") }}
        </button>
      </div>

      <div
        v-if="isImporting && !useFullscreenImportLoader"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80"
        aria-live="polite"
      >
        <img
          :src="loadingSpinnerSrc"
          alt=""
          class="h-12 w-12 animate-spin rounded-full shadow-md [animation-duration:1.2s]"
          aria-hidden="true"
        />
        <p class="text-sm font-semibold text-amber-900/85 dark:text-amber-100/85">
          {{ t("addRecipeForm.importing") }}
        </p>
      </div>
    </form>

    <Teleport to="body">
      <div
        v-if="isImporting && useFullscreenImportLoader"
        class="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          :src="loadingSpinnerSrc"
          alt=""
          class="h-16 w-16 animate-spin rounded-full shadow-lg [animation-duration:1.2s]"
          aria-hidden="true"
        />
        <p class="text-sm font-semibold text-amber-900/85 dark:text-amber-100/85">
          {{ t("addRecipeForm.importing") }}
        </p>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { importRecipeFromUrl } from "../data/importRecipeFromUrl";
import { isUserProvidedRecipeImage } from "../data/recipesDb";

const props = defineProps({
  initialRecipe: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["save-recipe", "cancel"]);
const { t } = useI18n();

const form = reactive({
  title: "",
  description: "",
  cuisine: "Italian",
  mealType: "Dinner",
  difficulty: "Easy",
  cookTimeMinutes: 20,
  servings: 2,
  ingredientsList: [""],
  stepsList: [""],
});

const loadingSpinnerSrc = `${import.meta.env.BASE_URL}favicon.svg`;
const error = ref("");
const importUrl = ref("");
const isImporting = ref(false);
const useFullscreenImportLoader = ref(false);

const FULLSCREEN_LOADER_QUERY = "(max-width: 639px), (max-height: 719px)";
let fullscreenLoaderMediaQuery = null;

function syncFullscreenImportLoader() {
  useFullscreenImportLoader.value = Boolean(fullscreenLoaderMediaQuery?.matches);
}

onMounted(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  fullscreenLoaderMediaQuery = window.matchMedia(FULLSCREEN_LOADER_QUERY);
  syncFullscreenImportLoader();
  fullscreenLoaderMediaQuery.addEventListener("change", syncFullscreenImportLoader);
});

onUnmounted(() => {
  fullscreenLoaderMediaQuery?.removeEventListener("change", syncFullscreenImportLoader);
  fullscreenLoaderMediaQuery = null;
});
const importError = ref("");
const importSuccess = ref("");
const selectedImage = ref(null);
const imageRemoved = ref(false);
const importedImageUrl = ref("");
const hasSelectedOrExistingImage = computed(() =>
  Boolean(
    selectedImage.value ||
      importedImageUrl.value ||
      (isUserProvidedRecipeImage(props.initialRecipe?.imageUrl) && !imageRemoved.value),
  ),
);
const displayImageName = computed(() => {
  if (selectedImage.value?.name) return selectedImage.value.name;
  if (importedImageUrl.value) return t("addRecipeForm.importedImage");
  if (isUserProvidedRecipeImage(props.initialRecipe?.imageUrl) && !imageRemoved.value) {
    return extractImageName(props.initialRecipe.imageUrl);
  }
  return t("addRecipeForm.noImageSelected");
});

const cuisineValues = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "French",
  "Thai",
  "Mediterranean",
  "Spanish",
  "Greek",
  "Korean",
  "Middle Eastern",
  "Vietnamese",
  "Turkish",
  "Lebanese",
  "American",
  "International",
];

const mealTypeValues = ["Breakfast", "Lunch", "Dinner", "Side", "Snack", "Dessert"];
const difficultyValues = ["Easy", "Medium", "Hard"];

const cuisineItems = computed(() =>
  cuisineValues.map((value) => ({
    value,
    label: t(`cuisine.${value.replace(/\s+/g, "")}`, value),
  })),
);

const mealTypeItems = computed(() =>
  mealTypeValues.map((value) => ({
    value,
    label: t(`mealType.${value}`, value),
  })),
);

const difficultyItems = computed(() =>
  difficultyValues.map((value) => ({
    value,
    label: t(`difficulty.${value}`, value),
  })),
);

function fillForm(recipe) {
  form.title = recipe?.title ?? "";
  form.description = recipe?.description ?? "";
  form.cuisine = recipe?.cuisine ?? "Italian";
  form.mealType = recipe?.mealType ?? "Dinner";
  form.difficulty = recipe?.difficulty ?? "Easy";
  form.cookTimeMinutes = recipe?.cookTimeMinutes ?? 20;
  form.servings = recipe?.servings ?? 2;
  form.ingredientsList = Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0 ? [...recipe.ingredients] : [""];
  form.stepsList = Array.isArray(recipe?.steps) && recipe.steps.length > 0 ? [...recipe.steps] : [""];
  selectedImage.value = null;
  imageRemoved.value = false;
  importedImageUrl.value = "";
  importError.value = "";
  importSuccess.value = "";
}

watch(
  () => props.initialRecipe,
  (recipe) => {
    fillForm(recipe);
  },
  { immediate: true },
);

function extractImageName(url) {
  try {
    const pathname = new URL(url).pathname;
    const candidate = pathname.split("/").pop() || "";
    return decodeURIComponent(candidate) || t("addRecipeForm.currentImage");
  } catch {
    return t("addRecipeForm.currentImage");
  }
}

function removeSelectedImage() {
  selectedImage.value = null;
  importedImageUrl.value = "";
  imageRemoved.value = true;
}

function onImageSelected() {
  imageRemoved.value = false;
  if (selectedImage.value) importedImageUrl.value = "";
}

async function handleImportFromUrl() {
  importError.value = "";
  importSuccess.value = "";
  error.value = "";

  const url = importUrl.value.trim();
  if (!url) {
    importError.value = t("addRecipeForm.importInvalidUrl");
    return;
  }

  isImporting.value = true;
  try {
    const imported = await importRecipeFromUrl(url);
    form.title = imported.title;
    form.description = imported.description;
    form.cuisine = imported.cuisine;
    form.mealType = imported.mealType;
    form.difficulty = imported.difficulty;
    form.cookTimeMinutes = imported.cookTimeMinutes;
    form.servings = imported.servings;
    form.ingredientsList = imported.ingredients.length > 0 ? [...imported.ingredients] : [""];
    form.stepsList = imported.steps.length > 0 ? [...imported.steps] : [""];
    selectedImage.value = null;
    imageRemoved.value = false;
    importedImageUrl.value = imported.imageUrl || "";
    importSuccess.value = t("addRecipeForm.importSuccess");
  } catch (err) {
    const code = String(err?.message ?? err ?? "");
    if (code === "INVALID_URL") {
      importError.value = t("addRecipeForm.importInvalidUrl");
    } else if (code === "NO_RECIPE_FOUND" || code === "INCOMPLETE_RECIPE") {
      importError.value = t("addRecipeForm.importNoRecipe");
    } else {
      importError.value = t("addRecipeForm.importFailed");
    }
  } finally {
    isImporting.value = false;
  }
}

function addIngredient() {
  form.ingredientsList.push("");
}

function insertIngredientAfter(index) {
  form.ingredientsList.splice(index + 1, 0, "");
}

function removeIngredient(index) {
  form.ingredientsList.splice(index, 1);
  if (form.ingredientsList.length === 0) form.ingredientsList.push("");
}

function addStep() {
  form.stepsList.push("");
}

function insertStepAfter(index) {
  form.stepsList.splice(index + 1, 0, "");
}

function removeStep(index) {
  form.stepsList.splice(index, 1);
  if (form.stepsList.length === 0) form.stepsList.push("");
}

function handleSubmit() {
  if (isImporting.value) return;
  error.value = "";
  const title = form.title.trim();
  const description = form.description.trim();
  const cuisine = form.cuisine;
  const mealType = form.mealType;
  const difficulty = form.difficulty;
  const cookTimeMinutes = Number(form.cookTimeMinutes);
  const servings = Number(form.servings);
  const ingredients = form.ingredientsList.map((item) => item.trim()).filter(Boolean);
  const steps = form.stepsList.map((item) => item.trim()).filter(Boolean);

  if (!title || !description || ingredients.length === 0 || steps.length === 0) {
    error.value = t("addRecipeForm.requiredError");
    return;
  }

  if (
    !Number.isFinite(cookTimeMinutes) ||
    cookTimeMinutes <= 0 ||
    cookTimeMinutes > 1440 ||
    !Number.isFinite(servings) ||
    servings <= 0 ||
    servings > 100
  ) {
    error.value = t("addRecipeForm.invalidNumbersError");
    return;
  }

  emit("save-recipe", {
    title,
    description,
    cuisine,
    mealType,
    difficulty,
    cookTimeMinutes,
    servings,
    ingredients,
    steps,
    imageFile: selectedImage.value,
    imageUrl: selectedImage.value ? "" : importedImageUrl.value,
    imageRemoved: imageRemoved.value,
  });
}
</script>
