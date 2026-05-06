<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  ingredients: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();
</script>

<template>
  <section class="rounded-2xl border border-amber-500/30 bg-zinc-900 px-5 py-4 shadow-sm">
    <h2 class="text-xl font-semibold text-amber-50">{{ t("details.ingredients") }}</h2>
    <ul class="mt-3 list-inside list-disc space-y-2 text-amber-100/85">
      <li v-for="item in ingredients" :key="item">{{ item }}</li>
    </ul>
  </section>
</template>
