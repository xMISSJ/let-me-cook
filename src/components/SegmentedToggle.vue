<template>
  <div
    class="relative grid"
    :class="containerClass"
    :style="{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }"
  >
    <span
      class="pointer-events-none absolute rounded-lg transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="indicatorClass"
      :style="{
        width: `calc((100% - ${indicatorInsetPx * 2}px) / ${items.length})`,
        transform: `translateX(${activeIndex * 100}%)`,
      }"
      aria-hidden="true"
    />
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="relative z-10"
      :class="[buttonClass, String(modelValue) === String(item.key) ? activeButtonClass : inactiveButtonClass]"
      :aria-label="item.ariaLabel || item.label || String(item.key)"
      :title="item.title || item.label || String(item.key)"
      @click="emit('update:modelValue', item.key)"
    >
      <slot name="option" :item="item" :active="String(modelValue) === String(item.key)">
        {{ item.label }}
      </slot>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  containerClass: {
    type: String,
    default: "rounded-xl p-1",
  },
  indicatorClass: {
    type: String,
    default: "bottom-1 top-1 bg-white shadow dark:bg-zinc-800",
  },
  indicatorInsetPx: {
    type: Number,
    default: 4,
  },
  buttonClass: {
    type: String,
    default: "rounded-lg px-2 py-2 text-sm font-semibold transition-colors duration-200 ease-out",
  },
  activeButtonClass: {
    type: String,
    default: "text-zinc-950 dark:text-zinc-100",
  },
  inactiveButtonClass: {
    type: String,
    default: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
  },
});

const emit = defineEmits(["update:modelValue"]);

const activeIndex = computed(() => {
  const index = props.items.findIndex((item) => String(item.key) === String(props.modelValue));
  return index >= 0 ? index : 0;
});
</script>
