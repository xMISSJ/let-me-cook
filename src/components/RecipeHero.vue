<script setup>
defineProps({
  isDetailView: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <header
    class="rounded-2xl border border-amber-500/40 bg-zinc-900 px-5 py-5 shadow-sm"
  >
    <p class="text-xs font-bold uppercase tracking-widest text-amber-300">
      Let Me Cook
    </p>
    <h1 class="mt-2 text-3xl font-bold text-amber-50">My Recipe Book</h1>
    <p class="mt-2 text-amber-100/85">
      {{
        isDetailView
          ? "Recipe details with ingredients and steps."
          : "Browse your recipes, open one for details, or add your own."
      }}
    </p>
  </header>
</template>
