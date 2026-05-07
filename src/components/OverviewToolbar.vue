<template>
  <section class="flex items-center justify-between gap-3 px-1 py-1">
    <p class="text-sm text-amber-900/85 md:hidden dark:text-amber-100/85">
      {{ t("overview.showing", { filtered: filteredCount, total: totalCount }) }}
    </p>
    <UButton
      class="cursor-pointer md:hidden"
      color="neutral"
      variant="outline"
      @click="emit('edit-filters')"
    >
      {{ t("overview.editFilters") }}
    </UButton>
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
