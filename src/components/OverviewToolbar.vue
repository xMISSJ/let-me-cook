<template>
  <section class="flex items-center justify-between gap-3 px-1 py-1">
    <p class="text-sm text-amber-900/85 md:hidden dark:text-amber-100/85">
      {{ t("overview.showing", { filtered: filteredCount, total: totalCount }) }}
    </p>
    <div class="ml-auto flex items-center gap-2">
      <SegmentedToggle
        :model-value="viewMode"
        :items="viewModeItems"
        container-class="inline-flex rounded-lg border border-amber-500/45 bg-white p-0.5 shadow-sm dark:bg-zinc-900"
        indicator-class="top-0.5 bottom-0.5 left-0.5 bg-amber-500 shadow-sm"
        :indicator-inset-px="2"
        button-class="inline-flex h-8 w-8 items-center justify-center rounded-md transition-[color,transform] duration-250"
        active-button-class="text-white scale-[1.03]"
        inactive-button-class="text-amber-900 lg:hover:bg-zinc-200 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
        @update:model-value="emit('update:view-mode', $event)"
      >
        <template #option="{ item }">
          <svg v-if="item.key === 'list'" viewBox="0 0 24 24" class="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8" />
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8" />
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8" />
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8" />
          </svg>
        </template>
      </SegmentedToggle>
      <UButton
        class="h-9 cursor-pointer md:hidden"
        color="neutral"
        variant="outline"
        @click="emit('edit-filters')"
      >
        {{ t("overview.editFilters") }}
      </UButton>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SegmentedToggle from "./SegmentedToggle.vue";

defineProps({
  filteredCount: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  viewMode: {
    type: String,
    default: "list",
  },
});

const emit = defineEmits(["edit-filters", "update:view-mode"]);

const { t } = useI18n();
const viewModeItems = computed(() => [
  { key: "list", label: t("overview.listView") },
  { key: "grid", label: t("overview.gridView") },
]);
</script>
