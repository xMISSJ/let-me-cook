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
    class="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/30 bg-zinc-900 p-3 shadow-sm"
  >
    <button
      class="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
      :class="
        activeTab === 'overview'
          ? 'bg-amber-500 text-zinc-950'
          : 'bg-zinc-800 text-amber-100 hover:bg-zinc-700'
      "
      type="button"
      @click="emit('change-tab', 'overview')"
    >
      {{ t("tabs.overview") }}
    </button>
    <button
      class="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
      :class="
        activeTab === 'details'
          ? 'bg-amber-500 text-zinc-950'
          : 'bg-zinc-800 text-amber-100 hover:bg-zinc-700'
      "
      type="button"
      @click="emit('change-tab', 'details')"
    >
      {{ t("tabs.details") }}
    </button>
  </nav>
</template>
