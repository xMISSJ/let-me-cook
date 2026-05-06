<script setup>
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();
</script>

<template>
  <section
    class="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900"
  >
    <p class="text-sm text-amber-900/85 dark:text-amber-100/85">
      {{ t("overview.showing", { filtered: filteredCount, total: totalCount }) }}
    </p>
    <button
      class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
      type="button"
      @click="emit('edit-filters')"
    >
      {{ t("overview.editFilters") }}
    </button>
  </section>
</template>
