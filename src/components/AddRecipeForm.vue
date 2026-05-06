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
  ingredientsText: "",
  stepsText: "",
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
  form.ingredientsText = Array.isArray(recipe?.ingredients) ? recipe.ingredients.join("\n") : "";
  form.stepsText = Array.isArray(recipe?.steps) ? recipe.steps.join("\n") : "";
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

function handleSubmit() {
  const title = form.title.trim();
  const description = form.description.trim();
  const cuisine = form.cuisine;
  const mealType = form.mealType;
  const difficulty = form.difficulty;
  const cookTimeMinutes = Number(form.cookTimeMinutes);
  const servings = Number(form.servings);
  const ingredients = form.ingredientsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const steps = form.stepsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

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
  if (!props.initialRecipe) resetForm();
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
      <textarea
        v-model="form.ingredientsText"
        class="min-h-24 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
        :placeholder="t('addRecipeForm.ingredientsPlaceholder')"
      />
      <textarea
        v-model="form.stepsText"
        class="min-h-32 rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
        :placeholder="t('addRecipeForm.stepsPlaceholder')"
      />
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
