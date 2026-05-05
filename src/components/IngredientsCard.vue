<script setup>
defineProps({
  ingredients: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section class="rounded-2xl border border-violet-500/30 bg-slate-900 px-5 py-4 shadow-sm">
    <h2 class="text-xl font-semibold text-violet-50">Ingredients</h2>
    <ul class="mt-3 list-inside list-disc space-y-2 text-violet-100/90">
      <li v-for="item in ingredients" :key="item">{{ item }}</li>
    </ul>
  </section>
</template>
