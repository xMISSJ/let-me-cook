<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  activeTab: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["change-tab"]);

const { t } = useI18n();
</script>

<template>
  <nav
    class="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-50 p-3 shadow-sm dark:bg-zinc-900"
  >
    <button
      class="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
      :class="
        activeTab === 'overview'
          ? 'bg-amber-500 text-zinc-950'
          : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
      "
      type="button"
      @click="emit('change-tab', 'overview')"
    >
      {{ t("tabs.overview") }}
    </button>
    <button
      class="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
      :class="
        activeTab === 'recent'
          ? 'bg-amber-500 text-zinc-950'
          : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
      "
      type="button"
      @click="emit('change-tab', 'recent')"
    >
      {{ t("tabs.recent") }}
    </button>
  </nav>
</template>
