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
    class="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-sm"
  >
    <p class="text-sm text-amber-100/85">
      {{ t("overview.showing", { filtered: filteredCount, total: totalCount }) }}
    </p>
    <button
      class="cursor-pointer rounded-lg border border-amber-500/50 bg-zinc-800 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-zinc-700"
      type="button"
      @click="emit('edit-filters')"
    >
      {{ t("overview.editFilters") }}
    </button>
  </section>
</template>
