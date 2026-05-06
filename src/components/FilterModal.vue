<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  cuisineOptions: {
    type: Array,
    required: true,
  },
  mealTypeOptions: {
    type: Array,
    required: true,
  },
  selectedCuisine: {
    type: String,
    required: true,
  },
  selectedMealType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "clear",
  "apply",
  "update:selected-cuisine",
  "update:selected-meal-type",
]);
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black/70 p-4 md:flex md:items-center md:justify-center"
    @click.self="emit('close')"
  >
    <section
      class="fixed bottom-0 left-0 right-0 rounded-t-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-xl md:static md:w-full md:max-w-xl md:rounded-2xl"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-amber-50">Filter Recipes</h2>
        <button
          class="cursor-pointer rounded-md px-2 py-1 text-sm text-amber-300 hover:bg-zinc-800 hover:text-amber-100"
          type="button"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-300/90">Cuisine</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in cuisineOptions"
              :key="option"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition"
              :class="
                selectedCuisine === option
                  ? 'border-amber-300 bg-amber-500/30 text-amber-50'
                  : 'border-amber-500/40 bg-zinc-800 text-amber-100 hover:border-amber-400/70 hover:bg-zinc-700'
              "
              type="button"
              @click="emit('update:selected-cuisine', option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
        <div class="grid gap-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-300/90">Meal Type</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in mealTypeOptions"
              :key="option"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition"
              :class="
                selectedMealType === option
                  ? 'border-amber-300 bg-amber-500/30 text-amber-50'
                  : 'border-amber-500/40 bg-zinc-800 text-amber-100 hover:border-amber-400/70 hover:bg-zinc-700'
              "
              type="button"
              @click="emit('update:selected-meal-type', option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <button
          class="cursor-pointer rounded-lg border border-amber-500/50 bg-zinc-800 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-zinc-700"
          type="button"
          @click="emit('clear')"
        >
          Clear Filters
        </button>
        <button
          class="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          type="button"
          @click="emit('apply')"
        >
          Apply
        </button>
      </div>
    </section>
  </div>
</template>
