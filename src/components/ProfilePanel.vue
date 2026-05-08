<template>
  <section
    class="overflow-hidden rounded-3xl border border-amber-500/30 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5 lg:rounded-2xl lg:px-7 lg:py-6 dark:bg-zinc-900"
  >
    <div class="mb-4 rounded-2xl border border-amber-500/25 bg-linear-to-br from-zinc-200/70 via-zinc-100/80 to-white px-4 py-4 dark:border-amber-300/20 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900 sm:px-5">
      <div class="flex items-center gap-3">
        <img
          :src="selectedProfileAvatar.src"
          :alt="selectedProfileAvatar.alt"
          class="h-11 w-11 shrink-0 rounded-full border border-amber-500/35 bg-white/85 object-cover shadow-sm dark:border-amber-300/25 dark:bg-zinc-800/85"
          loading="lazy"
        />
        <div class="min-w-0">
          <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ profileHeading }}</h2>
          <p class="mt-1 inline-flex items-center rounded-full border border-amber-500/25 bg-white/75 px-2 py-0.5 text-[11px] font-medium text-amber-900/80 dark:border-amber-300/20 dark:bg-zinc-800/70 dark:text-amber-100/80">
            {{ t("profile.customizeSpace") }}
          </p>
        </div>
      </div>
      <div class="mt-3">
        <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          {{ t("profile.setNamePreferences") }}
        </p>
      </div>
    </div>

    <div class="grid items-start gap-3 lg:gap-4 lg:grid-cols-2">
      <section class="rounded-2xl border border-amber-500/25 bg-white/80 p-4 shadow-[0_6px_18px_-16px_rgba(24,24,27,0.30)] dark:border-amber-300/20 dark:bg-zinc-800/70">
        <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">{{ t("profile.identityTitle") }}</h3>
        <p class="mt-1 text-xs text-amber-900/75 dark:text-amber-100/75">{{ t("profile.identityHint") }}</p>
        <div class="mt-4 grid gap-3">
          <div class="grid gap-2">
            <p class="text-sm text-amber-900/85 dark:text-amber-100/85">{{ t("profile.avatarLabel") }}</p>
            <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              <button
                v-for="avatar in profileAvatarOptions"
                :key="avatar.id"
                class="inline-flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border p-1 transition-[background-color,box-shadow,border-color] duration-200 ease-out"
                :class="
                  pendingProfileAvatar === avatar.id
                    ? 'border-amber-500 bg-zinc-200/70 shadow-sm dark:border-amber-300 dark:bg-zinc-700'
                    : 'border-amber-500/30 bg-white/70 lg:hover:bg-zinc-100 dark:border-amber-300/20 dark:bg-zinc-800/70 dark:lg:hover:bg-zinc-700'
                "
                type="button"
                @click="emit('select-profile-avatar', avatar.id)"
              >
                <img
                  :src="avatar.src"
                  :alt="avatar.alt"
                  class="h-full w-full rounded-[10px] bg-white/60 object-cover p-0.5 dark:bg-zinc-800/60"
                  loading="lazy"
                />
              </button>
            </div>
          </div>
          <label class="grid gap-1.5 text-sm text-amber-900/85 dark:text-amber-100/85">
            <span>{{ t("profile.nameOptionalLabel") }}</span>
            <input
              :value="pendingGuestName"
              class="w-full rounded-xl border border-amber-500/40 bg-white px-3 py-3 text-base text-amber-900 outline-none focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300 sm:py-2 sm:text-sm"
              :placeholder="t('profile.namePlaceholder')"
              type="text"
              @input="emit('update:pendingGuestName', $event.target.value)"
            />
          </label>
          <button
            class="inline-flex w-full items-center justify-center cursor-pointer rounded-xl border border-amber-500/50 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition-[background-color,box-shadow] duration-200 ease-out lg:hover:bg-zinc-200 lg:hover:shadow-sm dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700 sm:w-auto sm:py-2"
            type="button"
            @click="emit('save-guest-name')"
          >
            {{ t("profile.save") }}
          </button>
        </div>
      </section>

      <section class="w-full rounded-2xl border border-amber-500/25 bg-white/80 p-4 shadow-[0_6px_18px_-16px_rgba(24,24,27,0.30)] dark:border-amber-300/20 dark:bg-zinc-800/70 lg:hidden">
        <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">{{ t("profile.settingsTitle") }}</h3>
        <div class="mt-3 grid gap-2">
          <label class="grid min-h-14 gap-2 rounded-xl border border-amber-500/25 bg-zinc-50/90 px-3 py-2 text-sm text-amber-900/85 dark:border-amber-300/20 dark:bg-zinc-900/70 dark:text-amber-100/85 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center md:gap-3">
            <span class="font-medium">{{ t("profile.languageLabel") }}</span>
            <USelect
              :model-value="locale"
              :items="languageItems"
              value-key="value"
              :highlight="false"
              class="w-full"
              @update:model-value="emit('set-language', $event)"
            />
          </label>
          <div class="grid min-h-14 gap-2 rounded-xl border border-amber-500/25 bg-zinc-50/90 px-3 py-2 dark:border-amber-300/20 dark:bg-zinc-900/70 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center md:gap-3">
            <p class="text-sm font-medium text-amber-900/85 dark:text-amber-100/85">{{ t("profile.darkThemeLabel") }}</p>
            <label class="relative inline-flex h-9 w-fit cursor-pointer items-center">
              <input
                class="peer sr-only"
                type="checkbox"
                :checked="theme === 'dark'"
                :aria-label="t('profile.toggleDarkThemeAria')"
                @change="emit('toggle-theme')"
              />
              <span
                class="h-6 w-11 rounded-full bg-zinc-300/80 transition peer-checked:bg-amber-500 dark:bg-zinc-700 dark:peer-checked:bg-amber-400"
              />
              <span
                class="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5 dark:bg-zinc-950"
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineOptions({
  name: "ProfilePanel",
});

defineProps({
  profileHeading: {
    type: String,
    required: true,
  },
  selectedProfileAvatar: {
    type: Object,
    required: true,
  },
  profileAvatarOptions: {
    type: Array,
    required: true,
  },
  pendingProfileAvatar: {
    type: String,
    required: true,
  },
  pendingGuestName: {
    type: String,
    default: "",
  },
  locale: {
    type: String,
    required: true,
  },
  languageItems: {
    type: Array,
    required: true,
  },
  theme: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "update:pendingGuestName",
  "select-profile-avatar",
  "save-guest-name",
  "set-language",
  "toggle-theme",
]);
const { t } = useI18n();
</script>
