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

  error.value = "";
  if (!props.initialRecipe) {
    resetForm();
    emit("cancel");
  }
}
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
    <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">
      {{ props.initialRecipe ? t("addRecipeForm.editTitle") : t("addRecipeForm.title") }}
    </h2>
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
            class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-amber-900 outline-none focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option value="Italian">{{ t("cuisine.Italian") }}</option>
            <option value="Chinese">{{ t("cuisine.Chinese") }}</option>
            <option value="Japanese">{{ t("cuisine.Japanese") }}</option>
            <option value="Mexican">{{ t("cuisine.Mexican") }}</option>
            <option value="Indian">{{ t("cuisine.Indian") }}</option>
            <option value="American">{{ t("cuisine.American") }}</option>
            <option value="International">{{ t("cuisine.International") }}</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.mealType") }}</span>
          <select
            v-model="form.mealType"
            class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-amber-900 outline-none focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option value="Breakfast">{{ t("mealType.Breakfast") }}</option>
            <option value="Lunch">{{ t("mealType.Lunch") }}</option>
            <option value="Dinner">{{ t("mealType.Dinner") }}</option>
            <option value="Snack">{{ t("mealType.Snack") }}</option>
            <option value="Dessert">{{ t("mealType.Dessert") }}</option>
          </select>
        </label>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span>{{ t("addRecipeForm.difficulty") }}</span>
          <select
            v-model="form.difficulty"
            class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-amber-900 outline-none focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option value="Easy">{{ t("difficulty.Easy") }}</option>
            <option value="Medium">{{ t("difficulty.Medium") }}</option>
            <option value="Hard">{{ t("difficulty.Hard") }}</option>
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
          <div v-for="(item, index) in form.ingredientsList" :key="`ingredient-${index}`" class="flex items-center gap-2">
            <input
              v-model="form.ingredientsList[index]"
              class="min-w-0 flex-1 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
              :placeholder="`${t('details.ingredients')} ${index + 1}`"
              type="text"
            />
            <button
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/50 bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
              type="button"
              @click="insertIngredientAfter(index)"
              aria-label="Add ingredient row"
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
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/40 bg-white text-rose-700 hover:bg-rose-50 dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
              type="button"
              @click="removeIngredient(index)"
              aria-label="Remove ingredient row"
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

      <div class="grid gap-2">
        <p class="text-sm font-semibold text-amber-900/90 dark:text-amber-100/90">{{ t("details.steps") }}</p>
        <div class="grid gap-2">
          <div v-for="(item, index) in form.stepsList" :key="`step-${index}`" class="flex items-start gap-2">
            <span class="shrink-0 pt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">{{ index + 1 }}.</span>
            <input
              v-model="form.stepsList[index]"
              class="min-w-0 flex-1 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
              :placeholder="`Step ${index + 1}`"
              type="text"
            />
            <button
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/50 bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
              type="button"
              @click="insertStepAfter(index)"
              aria-label="Add step row"
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
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/40 bg-white text-rose-700 hover:bg-rose-50 dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
              type="button"
              @click="removeStep(index)"
              aria-label="Remove step row"
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
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          type="submit"
        >
          {{ props.submitLabel || (props.initialRecipe ? t("addRecipeForm.saveRecipe") : t("addRecipeForm.addRecipe")) }}
        </button>
        <button
          class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
          type="button"
          @click="emit('cancel')"
        >
          {{ t("addRecipeForm.cancel") }}
        </button>
      </div>
    </form>
  </section>
</template>
