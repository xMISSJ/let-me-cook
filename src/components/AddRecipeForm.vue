<template>
  <section class="min-h-dvh rounded-none border-0 bg-amber-50 px-4 py-4 shadow-none dark:bg-zinc-900 sm:min-h-0 sm:rounded-2xl sm:border sm:border-amber-500/30 sm:px-5 sm:shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">
        {{ props.initialRecipe ? t("addRecipeForm.editTitle") : t("addRecipeForm.title") }}
      </h2>
      <button
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/45 bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
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

    <form class="mt-4 grid gap-3" @submit.prevent="handleSubmit">
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
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.cuisine") }}</span>
          <select
            v-model="form.cuisine"
            class="w-full rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none focus:border-amber-500 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option v-for="item in cuisineItems" :key="item.value" :value="item.value">
              {{ item.label() }}
            </option>
          </select>
        </label>
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.mealType") }}</span>
          <select
            v-model="form.mealType"
            class="w-full rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none focus:border-amber-500 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option v-for="item in mealTypeItems" :key="item.value" :value="item.value">
              {{ item.label() }}
            </option>
          </select>
        </label>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.difficulty") }}</span>
          <select
            v-model="form.difficulty"
            class="w-full rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none focus:border-amber-500 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option v-for="item in difficultyItems" :key="item.value" :value="item.value">
              {{ item.label() }}
            </option>
          </select>
        </label>
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
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-amber-500/50 bg-white text-amber-900 hover:bg-amber-200 sm:h-9 sm:w-9 sm:flex-none dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
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
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-amber-500/50 bg-white text-amber-900 hover:bg-amber-200 sm:h-9 sm:w-9 sm:flex-none dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
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
      <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
        <span>{{ t("addRecipeForm.image") }}</span>
        <input
          class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-zinc-950 dark:bg-zinc-800 dark:text-amber-100"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          @change="onImageChange"
        />
      </label>
      <p v-if="error" class="text-sm font-medium text-rose-300">{{ error }}</p>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          class="inline-flex w-full items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 sm:w-auto"
          type="submit"
        >
          {{ props.submitLabel || (props.initialRecipe ? t("addRecipeForm.saveRecipe") : t("addRecipeForm.addRecipe")) }}
        </button>
        <button
          class="inline-flex w-full items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 sm:w-auto dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
          type="button"
          @click="emit('cancel')"
        >
          {{ t("addRecipeForm.cancel") }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

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

const error = ref("");
const selectedImage = ref(null);

const cuisineItems = [
  { label: () => t("cuisine.Italian"), value: "Italian" },
  { label: () => t("cuisine.Chinese"), value: "Chinese" },
  { label: () => t("cuisine.Japanese"), value: "Japanese" },
  { label: () => t("cuisine.Mexican"), value: "Mexican" },
  { label: () => t("cuisine.Indian"), value: "Indian" },
  { label: () => t("cuisine.French"), value: "French" },
  { label: () => t("cuisine.Thai"), value: "Thai" },
  { label: () => t("cuisine.Mediterranean"), value: "Mediterranean" },
  { label: () => t("cuisine.Spanish"), value: "Spanish" },
  { label: () => t("cuisine.Greek"), value: "Greek" },
  { label: () => t("cuisine.Korean"), value: "Korean" },
  { label: () => t("cuisine.MiddleEastern"), value: "Middle Eastern" },
  { label: () => t("cuisine.Vietnamese"), value: "Vietnamese" },
  { label: () => t("cuisine.Turkish"), value: "Turkish" },
  { label: () => t("cuisine.Lebanese"), value: "Lebanese" },
  { label: () => t("cuisine.American"), value: "American" },
  { label: () => t("cuisine.International"), value: "International" },
];

const mealTypeItems = [
  { label: () => t("mealType.Breakfast"), value: "Breakfast" },
  { label: () => t("mealType.Lunch"), value: "Lunch" },
  { label: () => t("mealType.Dinner"), value: "Dinner" },
  { label: () => t("mealType.Snack"), value: "Snack" },
  { label: () => t("mealType.Dessert"), value: "Dessert" },
];

const difficultyItems = [
  { label: () => t("difficulty.Easy"), value: "Easy" },
  { label: () => t("difficulty.Medium"), value: "Medium" },
  { label: () => t("difficulty.Hard"), value: "Hard" },
];

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
}

watch(
  () => props.initialRecipe,
  (recipe) => {
    fillForm(recipe);
  },
  { immediate: true },
);

function resetForm() {
  fillForm(props.initialRecipe);
}

function onImageChange(event) {
  const [file] = event.target.files ?? [];
  selectedImage.value = file ?? null;
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
  });
}
</script>
