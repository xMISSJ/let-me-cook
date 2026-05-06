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
    <p class="text-2xl font-extrabold uppercase tracking-[0.18em] text-amber-900 dark:text-amber-50">
      {{ t("appName") }}
    </p>
    <p class="mt-1 text-sm font-medium text-amber-900/85 dark:text-amber-100/85">
      Cook smarter, eat better.
    </p>
    <p class="mt-2 text-sm text-amber-900/75 dark:text-amber-100/75">
      {{
        isDetailView
          ? t("hero.detailDescription")
          : t("hero.overviewDescription")
      }}
    </p>
  </header>
</template>
