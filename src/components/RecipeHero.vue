<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  isDetailView: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
</script>

<template>
  <header
    class="rounded-2xl border border-amber-500/40 bg-amber-50 px-5 py-5 shadow-sm dark:bg-zinc-900"
  >
    <p class="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
      {{ t("appName") }}
    </p>
    <h1 class="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-50">{{ t("hero.title") }}</h1>
    <p class="mt-2 text-amber-900/85 dark:text-amber-100/85">
      {{
        isDetailView
          ? t("hero.detailDescription")
          : t("hero.overviewDescription")
      }}
    </p>
  </header>
</template>
