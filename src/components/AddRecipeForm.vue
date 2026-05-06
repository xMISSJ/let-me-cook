<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["add-recipe", "cancel"]);
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

function resetForm() {
  form.title = "";
  form.description = "";
  form.cuisine = "Italian";
  form.mealType = "Dinner";
  form.difficulty = "Easy";
  form.cookTimeMinutes = 20;
  form.servings = 2;
  form.ingredientsText = "";
  form.stepsText = "";
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

  emit("add-recipe", {
    title,
    description,
    cuisine,
    mealType,
    difficulty,
    cookTimeMinutes,
    servings,
    ingredients,
    steps,
  });

  error.value = "";
  resetForm();
}
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-sm">
    <h2 class="text-xl font-semibold text-amber-50">{{ t("addRecipeForm.title") }}</h2>
    <p class="mt-1 text-sm text-amber-100/85">
      {{ t("addRecipeForm.subtitle") }}
    </p>

    <form class="mt-4 grid gap-3" @submit.prevent="handleSubmit">
      <input
        v-model="form.title"
        class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        :placeholder="t('addRecipeForm.recipeTitle')"
        type="text"
      />
      <input
        v-model="form.description"
        class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        :placeholder="t('addRecipeForm.shortDescription')"
        type="text"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>{{ t("addRecipeForm.cuisine") }}</span>
          <select
            v-model="form.cuisine"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-amber-100 outline-none focus:border-amber-300"
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
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>{{ t("addRecipeForm.mealType") }}</span>
          <select
            v-model="form.mealType"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-amber-100 outline-none focus:border-amber-300"
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
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>{{ t("addRecipeForm.difficulty") }}</span>
          <select
            v-model="form.difficulty"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-amber-100 outline-none focus:border-amber-300"
          >
            <option value="Easy">{{ t("difficulty.Easy") }}</option>
            <option value="Medium">{{ t("difficulty.Medium") }}</option>
            <option value="Hard">{{ t("difficulty.Hard") }}</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>{{ t("addRecipeForm.cookTime") }}</span>
          <input
            v-model.number="form.cookTimeMinutes"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
            inputmode="numeric"
            min="1"
            max="1440"
            placeholder="20"
            type="number"
          />
        </label>
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>{{ t("addRecipeForm.servings") }}</span>
          <input
            v-model.number="form.servings"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
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
        class="min-h-24 rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        :placeholder="t('addRecipeForm.ingredientsPlaceholder')"
      />
      <textarea
        v-model="form.stepsText"
        class="min-h-32 rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        :placeholder="t('addRecipeForm.stepsPlaceholder')"
      />
      <p v-if="error" class="text-sm font-medium text-rose-300">{{ error }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          class="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          type="submit"
        >
          {{ t("addRecipeForm.addRecipe") }}
        </button>
        <button
          class="cursor-pointer rounded-lg border border-amber-500/50 bg-zinc-800 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-zinc-700"
          type="button"
          @click="emit('cancel')"
        >
          {{ t("addRecipeForm.cancel") }}
        </button>
      </div>
    </form>
  </section>
</template>
