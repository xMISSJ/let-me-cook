<template>
  <div class="fixed right-6 bottom-8 z-40 hidden lg:block">
    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <button
        v-if="showSettingsMascot"
        class="absolute right-0 bottom-12 w-48 cursor-pointer rounded-xl border border-amber-500/35 bg-amber-50/95 px-3 py-2 text-left shadow-md dark:border-amber-300/25 dark:bg-zinc-900/95"
        type="button"
        @click="$emit('dismiss-settings-mascot')"
      >
        <span
          class="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-amber-500/35 bg-amber-50/95 dark:border-amber-300/25 dark:bg-zinc-900/95"
          aria-hidden="true"
        />
        <div class="flex items-center gap-2">
          <span class="text-xl animate-[bobble_1.8s_ease-in-out_infinite]">🐻‍❄️</span>
          <p class="text-xs font-semibold text-amber-900 dark:text-amber-100">Hi there~!</p>
        </div>
        <p class="mt-1 text-[11px] text-amber-900/80 dark:text-amber-100/80">
          Your settings are here.
        </p>
      </button>
    </Transition>
    <div v-if="isDesktopSettingsOpen" class="font-sans absolute right-0 bottom-12 w-48 rounded-xl border border-amber-500/25 bg-amber-50/95 p-2 shadow-lg dark:border-amber-300/20 dark:bg-zinc-900/95">
      <USelect
        :model-value="locale"
        :items="languageItems"
        value-key="value"
        :highlight="false"
        class="w-full"
        @update:model-value="$emit('set-language', $event)"
      />
      <div class="mt-2 h-9 flex items-center justify-between rounded-lg border border-amber-500/20 bg-transparent px-2 py-1.5 dark:border-amber-300/15 dark:bg-transparent">
        <span class="font-sans text-sm font-normal text-amber-900/90 dark:text-amber-100/90">{{ t("profile.darkThemeLabel") }}</span>
        <label class="relative inline-flex h-7 w-fit cursor-pointer items-center">
          <input
            class="peer sr-only"
            type="checkbox"
            :checked="theme === 'dark'"
            :aria-label="t('profile.toggleDarkThemeAria')"
            @change="$emit('toggle-theme')"
          />
          <span
            class="h-4.5 w-8 rounded-full bg-amber-300/80 transition peer-checked:bg-amber-500 dark:bg-zinc-700 dark:peer-checked:bg-amber-400"
          />
          <span
            class="absolute left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-3.5 dark:bg-zinc-950"
          />
        </label>
      </div>
    </div>
    <button
      class="inline-flex cursor-pointer items-center justify-center rounded-full border border-amber-500/35 bg-amber-50/95 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-900 shadow-sm transition hover:bg-amber-100 dark:border-amber-300/30 dark:bg-zinc-900/95 dark:text-amber-100 dark:hover:bg-zinc-800"
      type="button"
      @click="$emit('toggle-desktop-settings')"
    >
      {{ t("profile.settingsTitle") }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  locale: { type: String, required: true },
  languageItems: { type: Array, required: true },
  theme: { type: String, required: true },
  showSettingsMascot: { type: Boolean, required: true },
  isDesktopSettingsOpen: { type: Boolean, required: true },
});

defineEmits(["dismiss-settings-mascot", "set-language", "toggle-theme", "toggle-desktop-settings"]);

const { t } = useI18n();
</script>
