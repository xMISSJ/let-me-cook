<script setup>
defineProps({
  activeMenu: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["navigate"]);

function navigateTo(menu) {
  emit("navigate", menu);
}
</script>

<template>
  <div>
    <nav class="hidden items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-50 p-3 shadow-sm md:flex dark:bg-zinc-900">
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="
          activeMenu === 'overview'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
        "
        type="button"
        @click="navigateTo('overview')"
      >
        Overview
      </button>
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="
          activeMenu === 'planner'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
        "
        type="button"
        @click="navigateTo('planner')"
      >
        Planner
      </button>
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="
          activeMenu === 'profile'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
        "
        type="button"
        @click="navigateTo('profile')"
      >
        Profile
      </button>
    </nav>

    <nav
      class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-amber-500/40 bg-amber-50/95 p-3 backdrop-blur md:hidden dark:border-amber-300/20 dark:bg-zinc-900/95"
    >
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg px-2 py-2 text-sm font-semibold transition"
        :class="
          activeMenu === 'overview'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
        "
        type="button"
        @click="navigateTo('overview')"
      >
        Overview
      </button>
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg px-2 py-2 text-sm font-semibold transition"
        :class="
          activeMenu === 'planner'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
        "
        type="button"
        @click="navigateTo('planner')"
      >
        Planner
      </button>
      <button
        class="inline-flex items-center justify-center cursor-pointer rounded-lg px-2 py-2 text-sm font-semibold transition"
        :class="
          activeMenu === 'profile'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-white text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700'
        "
        type="button"
        @click="navigateTo('profile')"
      >
        Profile
      </button>
    </nav>
  </div>
</template>
