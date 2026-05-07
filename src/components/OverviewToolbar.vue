<template>
  <section class="flex items-center justify-between gap-3 px-1 py-1">
    <p class="text-sm text-amber-900/85 md:hidden dark:text-amber-100/85">
      {{ t("overview.showing", { filtered: filteredCount, total: totalCount }) }}
    </p>
    <button
      class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 md:hidden dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
      type="button"
      @click="emit('edit-filters')"
    >
      {{ t("overview.editFilters") }}
    </button>
  </section>
</template>

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
