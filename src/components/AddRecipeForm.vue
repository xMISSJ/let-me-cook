<script setup>
import { reactive, ref } from "vue";

const emit = defineEmits(["add-recipe", "cancel"]);

const form = reactive({
  title: "",
  description: "",
  cuisine: "Italian",
  mealType: "Dinner",
  ingredientsText: "",
  stepsText: "",
});

const error = ref("");

function resetForm() {
  form.title = "";
  form.description = "";
  form.cuisine = "Italian";
  form.mealType = "Dinner";
  form.ingredientsText = "";
  form.stepsText = "";
}

function handleSubmit() {
  const title = form.title.trim();
  const description = form.description.trim();
  const cuisine = form.cuisine;
  const mealType = form.mealType;
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

  emit("add-recipe", {
    title,
    description,
    cuisine,
    mealType,
    ingredients,
    steps,
  });

  error.value = "";
  resetForm();
}
</script>

<template>
  <section class="rounded-2xl border border-violet-500/30 bg-slate-900 px-5 py-4 shadow-sm">
    <h2 class="text-xl font-semibold text-violet-50">Add Your Own Recipe</h2>
    <p class="mt-1 text-sm text-violet-200/90">
      Enter one ingredient and one step per line.
    </p>

    <form class="mt-4 grid gap-3" @submit.prevent="handleSubmit">
      <input
        v-model="form.title"
        class="rounded-lg border border-violet-500/40 bg-slate-800 px-3 py-2 text-sm text-violet-100 outline-none placeholder:text-violet-300/60 focus:border-violet-300"
        placeholder="Recipe title"
        type="text"
      />
      <input
        v-model="form.description"
        class="rounded-lg border border-violet-500/40 bg-slate-800 px-3 py-2 text-sm text-violet-100 outline-none placeholder:text-violet-300/60 focus:border-violet-300"
        placeholder="Short description"
        type="text"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="grid gap-1 text-sm text-violet-200/90">
          <span>Cuisine</span>
          <select
            v-model="form.cuisine"
            class="rounded-lg border border-violet-500/40 bg-slate-800 px-3 py-2 text-violet-100 outline-none focus:border-violet-300"
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
        <label class="grid gap-1 text-sm text-violet-200/90">
          <span>Meal Type</span>
          <select
            v-model="form.mealType"
            class="rounded-lg border border-violet-500/40 bg-slate-800 px-3 py-2 text-violet-100 outline-none focus:border-violet-300"
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snack</option>
            <option>Dessert</option>
          </select>
        </label>
      </div>
      <textarea
        v-model="form.ingredientsText"
        class="min-h-24 rounded-lg border border-violet-500/40 bg-slate-800 px-3 py-2 text-sm text-violet-100 outline-none placeholder:text-violet-300/60 focus:border-violet-300"
        placeholder="Ingredients (one per line)"
      />
      <textarea
        v-model="form.stepsText"
        class="min-h-32 rounded-lg border border-violet-500/40 bg-slate-800 px-3 py-2 text-sm text-violet-100 outline-none placeholder:text-violet-300/60 focus:border-violet-300"
        placeholder="Steps (one per line)"
      />
      <p v-if="error" class="text-sm font-medium text-rose-300">{{ error }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          class="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          type="submit"
        >
          Add Recipe
        </button>
        <button
          class="cursor-pointer rounded-lg border border-violet-500/50 bg-slate-800 px-4 py-2 text-sm font-semibold text-violet-200 hover:bg-slate-700"
          type="button"
          @click="emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
</template>
