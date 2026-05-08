<template>
  <section class="w-full">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch">
      <section class="h-full rounded-2xl border border-amber-500/30 bg-white px-3 py-3 shadow-sm dark:bg-zinc-900">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-50 sm:text-xl">{{ t("planner.title") }}</h2>
          <p class="mt-0.5 text-xs text-amber-900/85 dark:text-amber-100/85 sm:text-sm">
            {{ t("planner.subtitle") }}
          </p>
        </div>
        <button
          class="inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-zinc-950 transition-colors lg:hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="!plannerSelectedDate || !plannerSelectedRecipeId"
          @click="savePlannerEntry"
        >
          {{ t("planner.savePlan") }}
        </button>
      </div>
      <section class="mt-2.5 w-full rounded-xl border border-amber-500/30 bg-white p-2 dark:border-amber-300/20 dark:bg-zinc-800">
        <div class="mb-2 flex items-center justify-between gap-2">
          <button
            class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-amber-500/40 bg-white text-amber-900 transition-colors lg:hover:bg-zinc-100 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            :aria-label="t('planner.previousMonthAria')"
            @click="shiftPlannerWeek(-1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="h-3.5 w-3.5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M411.5 281h-298c-13.81 0-25-11.19-25-25s11.19-25 25-25h298c13.81 0 25 11.19 25 25s-11.19 25-25 25z" />
              <path d="M227.99 399.25c-6.08 0-12.18-2.21-16.99-6.67L83.5 274.33a25 25 0 0 1 .25-36.89l131-118.25c10.25-9.25 26.06-8.44 35.31 1.81s8.44 26.06-1.81 35.31l-110.72 99.94L245 355.92c10.12 9.39 10.72 25.21 1.33 35.33-4.93 5.31-11.62 8-18.34 8z" />
            </svg>
          </button>
          <p class="text-xs font-semibold text-amber-900 dark:text-amber-50 sm:text-sm">{{ plannerMobileWeekRangeLabel }}</p>
          <button
            class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-amber-500/40 bg-white text-amber-900 transition-colors lg:hover:bg-zinc-100 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            :aria-label="t('planner.nextMonthAria')"
            @click="shiftPlannerWeek(1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="h-3.5 w-3.5 rotate-180"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M411.5 281h-298c-13.81 0-25-11.19-25-25s11.19-25 25-25h298c13.81 0 25 11.19 25 25s-11.19 25-25 25z" />
              <path d="M227.99 399.25c-6.08 0-12.18-2.21-16.99-6.67L83.5 274.33a25 25 0 0 1 .25-36.89l131-118.25c10.25-9.25 26.06-8.44 35.31 1.81s8.44 26.06-1.81 35.31l-110.72 99.94L245 355.92c10.12 9.39 10.72 25.21 1.33 35.33-4.93 5.31-11.62 8-18.34 8z" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-7 gap-1 sm:hidden">
          <p
            v-for="(label, index) in plannerWeekdayNarrowLabels"
            :key="`mobile-${label}-${index}`"
            class="pb-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-900/65 dark:text-amber-100/65"
          >
            {{ label }}
          </p>
          <button
            v-for="day in plannerMobileWeekDays"
            :key="`mobile-${day.key}`"
            class="relative min-h-14 rounded-lg border px-1 py-1 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-200"
            :class="plannerCalendarCellClass(day)"
            type="button"
            :title="plannerCalendarTooltip(day)"
            @click="selectPlannerDate(day.date)"
          >
            <div class="flex h-full flex-col items-start justify-start text-left">
              <span
                class="inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold"
                :class="plannerCalendarDayBadgeClass(day)"
              >
                {{ day.dayNumber }}
              </span>
              <div
                v-if="day.hasPlan"
                class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md border p-0 text-center"
                :class="plannerCalendarPlanChipClass(day)"
              >
                <span class="text-xs leading-none">{{ day.plannedRecipeThumbnail }}</span>
              </div>
            </div>
            <span
              v-if="day.isToday && !day.isSelected"
              class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-300"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="hidden grid-cols-7 gap-1 sm:grid">
          <p
            v-for="label in plannerWeekdayLabels"
            :key="label"
            class="pb-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-900/65 dark:text-amber-100/65"
          >
            {{ label }}
          </p>
          <button
            v-for="day in plannerMobileWeekDays"
            :key="day.key"
            class="relative min-h-14 rounded-lg border px-1 py-1 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-200 sm:min-h-12 sm:rounded-md sm:px-0.5 sm:py-0.5 sm:text-xs"
            :class="plannerCalendarCellClass(day)"
            type="button"
            :title="plannerCalendarTooltip(day)"
            @click="selectPlannerDate(day.date)"
          >
            <div class="flex h-full flex-col items-start justify-start text-left">
              <span
                class="inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold sm:h-4.5 sm:min-w-4.5 sm:rounded sm:text-[10px]"
                :class="plannerCalendarDayBadgeClass(day)"
              >
                {{ day.dayNumber }}
              </span>
              <div
                v-if="day.hasPlan"
                class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md border p-0 text-center sm:mt-0.5 sm:h-5.5 sm:w-5.5 sm:rounded"
                :class="plannerCalendarPlanChipClass(day)"
              >
                <span class="text-xs leading-none sm:text-[11px]">{{ day.plannedRecipeThumbnail }}</span>
              </div>
            </div>
            <span
              v-if="day.isToday && !day.isSelected"
              class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-300 sm:right-0.5 sm:top-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
      <div class="mt-2.5 grid gap-2.5">
        <div class="grid gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:items-end md:gap-x-6">
          <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
            <span class="font-medium">{{ t("planner.dayLabel") }}</span>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-2 inline-flex items-center text-amber-700 dark:text-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M56.562 17.372C56.246 12.117 51.858 8 46.573 8H44V6a2 2 0 0 0-4 0v2H24V6a2 2 0 0 0-4 0v2h-2.573c-5.286 0-9.674 4.117-9.989 9.372-.593 9.884-.582 19.91.033 29.799.312 5.022 4.335 9.045 9.357 9.357 5.033.313 10.102.469 15.171.469 5.068 0 10.138-.156 15.171-.469 5.022-.312 9.045-4.335 9.357-9.357.616-9.884.627-19.909.035-29.799zm-4.026 29.551a6.006 6.006 0 0 1-5.613 5.613c-9.902.615-19.944.615-29.846 0a6.006 6.006 0 0 1-5.613-5.613A241.309 241.309 0 0 1 11.147 24h41.707c.252 7.64.155 15.323-.318 22.923zM22 16a2 2 0 0 0 2-2v-2h16v2a2 2 0 0 0 4 0v-2h2.573c3.173 0 5.807 2.465 5.996 5.611.047.794.067 1.593.106 2.389h-41.35c.04-.796.059-1.595.106-2.389C11.62 14.465 14.253 12 17.427 12H20v2a2 2 0 0 0 2 2z" />
                  <circle cx="22" cy="33" r="3" />
                  <circle cx="32" cy="33" r="3" />
                  <circle cx="22" cy="43" r="3" />
                  <circle cx="42" cy="33" r="3" />
                  <circle cx="42" cy="43" r="3" />
                  <circle cx="32" cy="43" r="3" />
                </svg>
              </span>
              <input
                v-model="plannerSelectedDate"
                type="date"
                class="planner-date-input min-h-9 w-full appearance-none rounded-lg border border-amber-500/35 bg-white py-1.5 pl-8 pr-2.5 text-sm text-amber-900 outline-none transition-colors focus:border-amber-500 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
              />
            </div>
          </label>
          <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
            <span class="font-medium">{{ t("planner.recipeLabel") }}</span>
            <USelect
              :model-value="plannerSelectedRecipeId || undefined"
              :items="plannerRecipeOptions"
              value-key="value"
              label-key="label"
              :highlight="false"
              class="w-full"
              :placeholder="t('planner.chooseRecipe')"
              @update:model-value="plannerSelectedRecipeId = $event ?? ''"
            />
          </label>
        </div>
      </div>
      </section>

      <div class="grid h-full auto-rows-fr gap-3">
        <section
          v-if="plannerSelectedDate"
          class="h-full rounded-2xl border border-amber-500/30 bg-white px-3 py-3 shadow-sm dark:bg-zinc-900"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">
                {{ t("planner.planForDate", { date: formatPlannerDate(plannerSelectedDate) }) }}
              </h3>
              <p class="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
                {{ selectedDatePlan ? t("planner.dayPlanned") : t("planner.noPlanForDay") }}
              </p>
            </div>
            <button
              v-if="selectedDatePlan"
              class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/45 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition-colors lg:hover:bg-zinc-100 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
              type="button"
              @click="clearPlannerEntry(plannerSelectedDate)"
            >
              {{ t("planner.clearDay") }}
            </button>
          </div>

          <div
            v-if="selectedDatePlan"
            class="mt-2.5 flex items-center justify-between gap-2.5 rounded-xl border border-amber-500/30 bg-white px-2.5 py-2.5 dark:bg-zinc-800"
          >
            <button
              class="flex min-w-0 cursor-pointer items-center gap-3 text-left"
              type="button"
              @click="openPlannedRecipe(selectedDatePlan.recipe.id)"
            >
              <span class="text-xl">{{ selectedDatePlan.recipe.thumbnail || "🍽️" }}</span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-amber-900 dark:text-amber-50">{{ selectedDatePlan.recipe.title }}</p>
                <p class="mt-0.5 text-xs text-amber-900/75 dark:text-amber-100/75">
                  {{ t(`cuisine.${selectedDatePlan.recipe.cuisine}`, selectedDatePlan.recipe.cuisine) }} -
                  {{ t(`mealType.${selectedDatePlan.recipe.mealType}`, selectedDatePlan.recipe.mealType) }}
                </p>
              </div>
            </button>
          </div>
        </section>

        <section class="h-full rounded-2xl border border-amber-500/30 bg-white px-3 py-3 shadow-sm dark:bg-zinc-900">
          <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">{{ t("planner.upcomingPlans") }}</h3>
          <p v-if="plannedMeals.length === 0" class="mt-2 text-sm text-amber-900/80 dark:text-amber-100/80">
            {{ t("planner.noPlannedRecipes") }}
          </p>
          <div v-else class="mt-3 grid gap-2">
            <div
              v-for="entry in plannedMeals"
              :key="entry.date"
              class="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-white px-3 py-2.5 dark:bg-zinc-800"
            >
              <div class="min-w-0">
                <p class="text-xs font-medium uppercase tracking-wide text-amber-900/70 dark:text-amber-100/70">
                  {{ formatPlannerDate(entry.date) }}
                </p>
                <button
                  class="mt-0.5 inline-flex min-w-0 cursor-pointer items-center gap-1.5 text-sm font-semibold text-amber-900 dark:text-amber-50"
                  type="button"
                  @click="openPlannedRecipe(entry.recipe.id)"
                >
                  <span>{{ entry.recipe.thumbnail || "🍽️" }}</span>
                  <span class="truncate">{{ entry.recipe.title }}</span>
                </button>
              </div>
              <button
                class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/45 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 transition-colors lg:hover:bg-zinc-100 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
                type="button"
                @click="clearPlannerEntry(entry.date)"
              >
                {{ t("planner.remove") }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "PlannerPanel",
});

const props = defineProps({
  recipes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["open-recipe"]);
const { t } = useI18n();

const plannerAssignments = ref({});
const plannerSelectedDate = ref("");
const plannerSelectedRecipeId = ref("");
const plannerVisibleMonth = ref("");

const plannerDateDisplay = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const plannerMonthDisplay = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});
const plannerWeekRangeDisplay = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});
const plannerWeekdayNarrowDisplay = new Intl.DateTimeFormat(undefined, {
  weekday: "narrow",
});
const plannerWeekdayLabels = computed(() => [
  t("planner.weekdays.sun"),
  t("planner.weekdays.mon"),
  t("planner.weekdays.tue"),
  t("planner.weekdays.wed"),
  t("planner.weekdays.thu"),
  t("planner.weekdays.fri"),
  t("planner.weekdays.sat"),
]);
const plannerWeekdayNarrowLabels = computed(() => {
  const weekStart = new Date("2026-01-04T00:00:00");
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return plannerWeekdayNarrowDisplay.format(day);
  });
});

const plannerRecipeOptions = computed(() =>
  props.recipes
    .slice()
    .sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")))
    .map((recipe) => ({
      value: String(recipe.id),
      label: `${recipe.thumbnail || "🍽️"} ${recipe.title} - ${t(`mealType.${recipe.mealType}`, recipe.mealType)}`,
    })),
);

const plannedMeals = computed(() => {
  const recipeById = new Map(props.recipes.map((recipe) => [String(recipe.id), recipe]));
  return Object.entries(plannerAssignments.value)
    .map(([date, recipeId]) => ({
      date,
      recipe: recipeById.get(String(recipeId)) ?? null,
    }))
    .filter((entry) => entry.recipe)
    .sort((a, b) => a.date.localeCompare(b.date));
});

const selectedDatePlan = computed(() => {
  const targetDate = plannerSelectedDate.value;
  if (!targetDate) return null;
  return plannedMeals.value.find((entry) => entry.date === targetDate) ?? null;
});

const plannerVisibleMonthLabel = computed(() => {
  if (!plannerVisibleMonth.value) return "";
  const monthDate = new Date(`${plannerVisibleMonth.value}-01T00:00:00`);
  if (Number.isNaN(monthDate.getTime())) return plannerVisibleMonth.value;
  return plannerMonthDisplay.format(monthDate);
});

const plannerMobileWeekDays = computed(() => {
  const anchor = plannerSelectedDate.value || new Date().toISOString().slice(0, 10);
  const anchorDate = new Date(`${anchor}T00:00:00`);
  if (Number.isNaN(anchorDate.getTime())) return [];
  const recipeById = new Map(props.recipes.map((recipe) => [String(recipe.id), recipe]));
  const todayString = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() - anchorDate.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const assignedRecipeId = plannerAssignments.value[dateString];
    const assignedRecipe = assignedRecipeId ? recipeById.get(String(assignedRecipeId)) : null;
    return {
      key: dateString,
      date: dateString,
      dayNumber: String(date.getDate()),
      isCurrentMonth: dateString.slice(0, 7) === plannerVisibleMonth.value,
      isToday: dateString === todayString,
      isSelected: dateString === plannerSelectedDate.value,
      hasPlan: Boolean(assignedRecipe),
      plannedRecipeTitle: assignedRecipe?.title ?? "",
      plannedRecipeThumbnail: assignedRecipe?.thumbnail || "🍽️",
      plannedRecipeCuisine: assignedRecipe?.cuisine ?? "",
      plannedRecipeMealType: assignedRecipe?.mealType ?? "",
    };
  });
});

const plannerMobileWeekRangeLabel = computed(() => {
  if (plannerMobileWeekDays.value.length === 0) return "";
  const first = plannerMobileWeekDays.value[0]?.date;
  const last = plannerMobileWeekDays.value[plannerMobileWeekDays.value.length - 1]?.date;
  if (!first || !last) return "";
  const firstDate = new Date(`${first}T00:00:00`);
  const lastDate = new Date(`${last}T00:00:00`);
  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())) return "";
  return `${plannerWeekRangeDisplay.format(firstDate)} - ${plannerWeekRangeDisplay.format(lastDate)}`;
});

const plannerCalendarDays = computed(() => {
  if (!plannerVisibleMonth.value) return [];
  const firstDay = new Date(`${plannerVisibleMonth.value}-01T00:00:00`);
  if (Number.isNaN(firstDay.getTime())) return [];
  const recipeById = new Map(props.recipes.map((recipe) => [String(recipe.id), recipe]));
  const year = firstDay.getFullYear();
  const month = firstDay.getMonth();
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells = [];
  const todayString = new Date().toISOString().slice(0, 10);

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const dayNumber = daysInPreviousMonth - i;
    const previousDate = new Date(year, month - 1, dayNumber);
    const dateString = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const assignedRecipeId = plannerAssignments.value[dateString];
    const assignedRecipe = assignedRecipeId ? recipeById.get(String(assignedRecipeId)) : null;
    cells.push({
      key: dateString,
      date: dateString,
      dayNumber: String(dayNumber),
      isCurrentMonth: false,
      isToday: dateString === todayString,
      isSelected: dateString === plannerSelectedDate.value,
      hasPlan: Boolean(assignedRecipe),
      plannedRecipeTitle: assignedRecipe?.title ?? "",
      plannedRecipeThumbnail: assignedRecipe?.thumbnail || "🍽️",
      plannedRecipeCuisine: assignedRecipe?.cuisine ?? "",
      plannedRecipeMealType: assignedRecipe?.mealType ?? "",
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateString = `${plannerVisibleMonth.value}-${String(day).padStart(2, "0")}`;
    const assignedRecipeId = plannerAssignments.value[dateString];
    const assignedRecipe = assignedRecipeId ? recipeById.get(String(assignedRecipeId)) : null;
    cells.push({
      key: dateString,
      date: dateString,
      dayNumber: String(day),
      isCurrentMonth: true,
      isToday: dateString === todayString,
      isSelected: dateString === plannerSelectedDate.value,
      hasPlan: Boolean(assignedRecipe),
      plannedRecipeTitle: assignedRecipe?.title ?? "",
      plannedRecipeThumbnail: assignedRecipe?.thumbnail || "🍽️",
      plannedRecipeCuisine: assignedRecipe?.cuisine ?? "",
      plannedRecipeMealType: assignedRecipe?.mealType ?? "",
    });
  }

  let nextMonthDay = 1;
  while (cells.length < 42) {
    const nextDate = new Date(year, month + 1, nextMonthDay);
    const dateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(nextMonthDay).padStart(2, "0")}`;
    const assignedRecipeId = plannerAssignments.value[dateString];
    const assignedRecipe = assignedRecipeId ? recipeById.get(String(assignedRecipeId)) : null;
    cells.push({
      key: dateString,
      date: dateString,
      dayNumber: String(nextMonthDay),
      isCurrentMonth: false,
      isToday: dateString === todayString,
      isSelected: dateString === plannerSelectedDate.value,
      hasPlan: Boolean(assignedRecipe),
      plannedRecipeTitle: assignedRecipe?.title ?? "",
      plannedRecipeThumbnail: assignedRecipe?.thumbnail || "🍽️",
      plannedRecipeCuisine: assignedRecipe?.cuisine ?? "",
      plannedRecipeMealType: assignedRecipe?.mealType ?? "",
    });
    nextMonthDay += 1;
  }

  return cells;
});

onMounted(() => {
  const storedPlannerAssignments = localStorage.getItem("let-me-cook-planner-assignments");
  if (storedPlannerAssignments) {
    try {
      const parsed = JSON.parse(storedPlannerAssignments);
      plannerAssignments.value = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      plannerAssignments.value = {};
    }
  }

  plannerSelectedDate.value = new Date().toISOString().slice(0, 10);
  plannerVisibleMonth.value = plannerSelectedDate.value.slice(0, 7);
});

watch(plannerSelectedDate, (value) => {
  if (!value) return;
  plannerVisibleMonth.value = value.slice(0, 7);
});

watch(
  () => props.recipes,
  (nextRecipes) => {
    const allowedIds = new Set(nextRecipes.map((recipe) => String(recipe.id)));
    const prunedAssignments = Object.fromEntries(
      Object.entries(plannerAssignments.value).filter(([, recipeId]) => allowedIds.has(String(recipeId))),
    );
    if (Object.keys(prunedAssignments).length !== Object.keys(plannerAssignments.value).length) {
      plannerAssignments.value = prunedAssignments;
      localStorage.setItem("let-me-cook-planner-assignments", JSON.stringify(plannerAssignments.value));
    }
  },
  { deep: true },
);

function formatPlannerDate(dateValue) {
  if (!dateValue) return "";
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return plannerDateDisplay.format(parsed);
}

function savePlannerEntry() {
  if (!plannerSelectedDate.value || !plannerSelectedRecipeId.value) return;
  plannerAssignments.value = {
    ...plannerAssignments.value,
    [plannerSelectedDate.value]: plannerSelectedRecipeId.value,
  };
  localStorage.setItem("let-me-cook-planner-assignments", JSON.stringify(plannerAssignments.value));
}

function clearPlannerEntry(dateValue) {
  if (!dateValue) return;
  const nextAssignments = { ...plannerAssignments.value };
  delete nextAssignments[dateValue];
  plannerAssignments.value = nextAssignments;
  localStorage.setItem("let-me-cook-planner-assignments", JSON.stringify(plannerAssignments.value));
}

function selectPlannerDate(dateValue) {
  if (!dateValue) return;
  plannerSelectedDate.value = dateValue;
  plannerVisibleMonth.value = dateValue.slice(0, 7);
}

function shiftPlannerMonth(offset) {
  if (!plannerVisibleMonth.value) return;
  const monthDate = new Date(`${plannerVisibleMonth.value}-01T00:00:00`);
  if (Number.isNaN(monthDate.getTime())) return;
  monthDate.setMonth(monthDate.getMonth() + offset);
  plannerVisibleMonth.value = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
}

function shiftPlannerWeek(offset) {
  const anchor = plannerSelectedDate.value || new Date().toISOString().slice(0, 10);
  const anchorDate = new Date(`${anchor}T00:00:00`);
  if (Number.isNaN(anchorDate.getTime())) return;
  anchorDate.setDate(anchorDate.getDate() + offset * 7);
  selectPlannerDate(`${anchorDate.getFullYear()}-${String(anchorDate.getMonth() + 1).padStart(2, "0")}-${String(anchorDate.getDate()).padStart(2, "0")}`);
}

function plannerCalendarCellClass(day) {
  if (day.isSelected) return "cursor-pointer border-amber-500 bg-amber-500 text-zinc-950 shadow-sm shadow-amber-900/20";
  if (day.hasPlan && day.isCurrentMonth) {
    return "cursor-pointer border-emerald-500/45 bg-emerald-50/95 text-emerald-950 lg:hover:border-emerald-500/70 lg:hover:bg-emerald-100 dark:border-emerald-300/35 dark:bg-emerald-950/25 dark:text-emerald-100 dark:lg:hover:bg-emerald-900/45";
  }
  if (day.hasPlan && !day.isCurrentMonth) {
    return "cursor-pointer border-emerald-500/30 bg-emerald-50/60 text-emerald-800/80 lg:hover:bg-emerald-100/70 dark:border-emerald-300/25 dark:bg-emerald-950/20 dark:text-emerald-200/80 dark:lg:hover:bg-emerald-900/40";
  }
  if (day.isCurrentMonth) {
    return "cursor-pointer border-amber-500/25 bg-white text-amber-900 lg:hover:border-amber-500/45 lg:hover:bg-zinc-100 dark:border-amber-300/20 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700";
  }
  return "cursor-pointer border-amber-500/15 bg-zinc-50/50 text-amber-900/50 lg:hover:bg-zinc-100/70 dark:border-amber-300/10 dark:bg-zinc-900/40 dark:text-amber-100/45 dark:lg:hover:bg-zinc-800/60";
}

function plannerCalendarDayBadgeClass(day) {
  if (day.isSelected) return "bg-zinc-950/15 text-zinc-950";
  if (day.isCurrentMonth) return "bg-zinc-200/70 text-amber-900 dark:bg-zinc-700/80 dark:text-amber-100";
  return "bg-zinc-200/45 text-amber-900/70 dark:bg-zinc-700/45 dark:text-amber-100/70";
}

function plannerCalendarPlanChipClass(day) {
  if (day.isSelected) return "border-zinc-950/20 bg-zinc-950/10";
  if (day.isCurrentMonth) return "border-emerald-500/35 bg-white/85 dark:border-emerald-300/25 dark:bg-zinc-900/60";
  return "border-emerald-500/25 bg-white/70 dark:border-emerald-300/20 dark:bg-zinc-900/45";
}

function plannerCalendarTooltip(day) {
  const dateLabel = formatPlannerDate(day.date);
  if (!day.hasPlan) return dateLabel;
  const cuisineLabel = day.plannedRecipeCuisine
    ? t(`cuisine.${day.plannedRecipeCuisine}`, day.plannedRecipeCuisine)
    : "";
  const mealTypeLabel = day.plannedRecipeMealType
    ? t(`mealType.${day.plannedRecipeMealType}`, day.plannedRecipeMealType)
    : "";
  const details = [cuisineLabel, mealTypeLabel].filter(Boolean).join(" - ");
  return details
    ? `${dateLabel}\n${day.plannedRecipeTitle}\n${details}`
    : `${dateLabel}\n${day.plannedRecipeTitle}`;
}

function openPlannedRecipe(recipeId) {
  emit("open-recipe", recipeId);
}
</script>

<style scoped>
.planner-date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  pointer-events: none;
}
</style>
