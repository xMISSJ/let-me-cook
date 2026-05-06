<script setup>
defineProps({
  filteredCount: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["edit-filters"]);
</script>

<template>
  <section
    class="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-sm"
  >
    <p class="text-sm text-amber-100/85">Showing {{ filteredCount }} of {{ totalCount }} recipes</p>
    <button
      class="cursor-pointer rounded-lg border border-amber-500/50 bg-zinc-800 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-zinc-700"
      type="button"
      @click="emit('edit-filters')"
    >
      Edit Filters
    </button>
  </section>
</template>
