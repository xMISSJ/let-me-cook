<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section class="rounded-2xl border border-violet-500/30 bg-slate-900 px-5 py-4 shadow-sm">
    <h2 class="text-xl font-semibold text-violet-50">Steps</h2>
    <ol class="mt-3 list-inside list-decimal space-y-2 text-violet-100/90">
      <li v-for="item in steps" :key="item">{{ item }}</li>
    </ol>
  </section>
</template>
