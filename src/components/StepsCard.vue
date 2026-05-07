<template>
  <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
    <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ t("details.steps") }}</h2>
    <ol class="mt-3 list-inside list-decimal space-y-2 text-amber-900/85 dark:text-amber-100/85">
      <li v-for="item in steps" :key="item">{{ item }}</li>
    </ol>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  steps: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();
</script>
