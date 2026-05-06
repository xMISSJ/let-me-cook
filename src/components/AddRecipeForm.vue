<script setup>
import { reactive, ref } from "vue";

const emit = defineEmits(["add-recipe", "cancel"]);

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
    error.value =
      "Please fill in title, description, and at least one ingredient and step.";
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
    error.value = "Please enter a valid cook time and servings.";
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
    <h2 class="text-xl font-semibold text-amber-50">Add Your Own Recipe</h2>
    <p class="mt-1 text-sm text-amber-100/85">
      Enter one ingredient and one step per line.
    </p>

    <form class="mt-4 grid gap-3" @submit.prevent="handleSubmit">
      <input
        v-model="form.title"
        class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        placeholder="Recipe title"
        type="text"
      />
      <input
        v-model="form.description"
        class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        placeholder="Short description"
        type="text"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>Cuisine</span>
          <select
            v-model="form.cuisine"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-amber-100 outline-none focus:border-amber-300"
          >
            <option>Italian</option>
            <option>Chinese</option>
            <option>Japanese</option>
            <option>Mexican</option>
            <option>Indian</option>
            <option>American</option>
            <option>International</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>Meal Type</span>
          <select
            v-model="form.mealType"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-amber-100 outline-none focus:border-amber-300"
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snack</option>
            <option>Dessert</option>
          </select>
        </label>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>Difficulty</span>
          <select
            v-model="form.difficulty"
            class="rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-amber-100 outline-none focus:border-amber-300"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm text-amber-100/85">
          <span>Cook time (min)</span>
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
          <span>Servings</span>
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
        placeholder="Ingredients (one per line)"
      />
      <textarea
        v-model="form.stepsText"
        class="min-h-32 rounded-lg border border-amber-500/40 bg-zinc-800 px-3 py-2 text-sm text-amber-100 outline-none placeholder:text-amber-200/55 focus:border-amber-300"
        placeholder="Steps (one per line)"
      />
      <p v-if="error" class="text-sm font-medium text-rose-300">{{ error }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          class="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          type="submit"
        >
          Add Recipe
        </button>
        <button
          class="cursor-pointer rounded-lg border border-amber-500/50 bg-zinc-800 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-zinc-700"
          type="button"
          @click="emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
</template>
