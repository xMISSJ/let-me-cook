<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section class="rounded-2xl border border-amber-200 bg-white px-5 py-4 shadow-sm">
    <h2 class="text-xl font-semibold text-amber-950">Steps</h2>
    <ol class="mt-3 list-inside list-decimal space-y-2 text-amber-900">
      <li v-for="item in steps" :key="item">{{ item }}</li>
    </ol>
  </section>
</template>
