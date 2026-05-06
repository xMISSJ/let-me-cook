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
const plannerWeekdayLabels = computed(() => [
  t("planner.weekdays.sun"),
  t("planner.weekdays.mon"),
  t("planner.weekdays.tue"),
  t("planner.weekdays.wed"),
  t("planner.weekdays.thu"),
  t("planner.weekdays.fri"),
  t("planner.weekdays.sat"),
]);

const plannerRecipeOptions = computed(() =>
  props.recipes
    .slice()
    .sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")))
    .map((recipe) => ({
      id: String(recipe.id),
      title: recipe.title,
      cuisine: recipe.cuisine,
      mealType: recipe.mealType,
      thumbnail: recipe.thumbnail || "🍽️",
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

function plannerCalendarCellClass(day) {
  if (day.isSelected) return "cursor-pointer border-amber-500 bg-amber-500 text-zinc-950 shadow-sm shadow-amber-900/20";
  if (day.hasPlan && day.isCurrentMonth) {
    return "cursor-pointer border-emerald-500/45 bg-emerald-50/95 text-emerald-950 lg:hover:border-emerald-500/70 lg:hover:bg-emerald-100 dark:border-emerald-300/35 dark:bg-emerald-950/25 dark:text-emerald-100 dark:lg:hover:bg-emerald-900/45";
  }
  if (day.hasPlan && !day.isCurrentMonth) {
    return "cursor-pointer border-emerald-500/30 bg-emerald-50/60 text-emerald-800/80 lg:hover:bg-emerald-100/70 dark:border-emerald-300/25 dark:bg-emerald-950/20 dark:text-emerald-200/80 dark:lg:hover:bg-emerald-900/40";
  }
  if (day.isCurrentMonth) {
    return "cursor-pointer border-amber-500/25 bg-white text-amber-900 lg:hover:border-amber-500/45 lg:hover:bg-amber-100 dark:border-amber-300/20 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700";
  }
  return "cursor-pointer border-amber-500/15 bg-amber-50/50 text-amber-900/50 lg:hover:bg-amber-100/70 dark:border-amber-300/10 dark:bg-zinc-900/40 dark:text-amber-100/45 dark:lg:hover:bg-zinc-800/60";
}

function plannerCalendarDayBadgeClass(day) {
  if (day.isSelected) return "bg-zinc-950/15 text-zinc-950";
  if (day.isCurrentMonth) return "bg-amber-200/70 text-amber-900 dark:bg-zinc-700/80 dark:text-amber-100";
  return "bg-amber-200/45 text-amber-900/70 dark:bg-zinc-700/45 dark:text-amber-100/70";
}

function plannerCalendarPlanChipClass(day) {
  if (day.isSelected) return "border-zinc-950/20 bg-zinc-950/10";
  if (day.isCurrentMonth) return "border-emerald-500/35 bg-white/85 dark:border-emerald-300/25 dark:bg-zinc-900/60";
  return "border-emerald-500/25 bg-white/70 dark:border-emerald-300/20 dark:bg-zinc-900/45";
}

function openPlannedRecipe(recipeId) {
  emit("open-recipe", recipeId);
}
</script>

<template>
  <section class="grid gap-4">
    <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-5 shadow-sm dark:bg-zinc-900">
      <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ t("planner.title") }}</h2>
      <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
        {{ t("planner.subtitle") }}
      </p>
      <section class="mt-4 rounded-xl border border-amber-500/30 bg-white p-3 dark:border-amber-300/20 dark:bg-zinc-800">
        <div class="mb-3 flex items-center justify-between gap-2">
          <button
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-amber-500/40 bg-white text-amber-900 transition-colors lg:hover:bg-amber-100 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            :aria-label="t('planner.previousMonthAria')"
            @click="shiftPlannerMonth(-1)"
          >
            ←
          </button>
          <p class="text-sm font-semibold text-amber-900 dark:text-amber-50">{{ plannerVisibleMonthLabel }}</p>
          <button
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-amber-500/40 bg-white text-amber-900 transition-colors lg:hover:bg-amber-100 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            :aria-label="t('planner.nextMonthAria')"
            @click="shiftPlannerMonth(1)"
          >
            →
          </button>
        </div>
        <div class="grid grid-cols-7 gap-1.5">
          <p
            v-for="label in plannerWeekdayLabels"
            :key="label"
            class="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-amber-900/65 dark:text-amber-100/65"
          >
            {{ label }}
          </p>
          <button
            v-for="day in plannerCalendarDays"
            :key="day.key"
            class="relative min-h-16 rounded-xl border px-1.5 py-1.5 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-200"
            :class="plannerCalendarCellClass(day)"
            type="button"
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
                class="mt-1 w-full rounded-md border px-1.5 py-1 text-left"
                :class="plannerCalendarPlanChipClass(day)"
              >
                <p
                  class="w-full truncate text-[10px] font-semibold leading-tight"
                  :title="day.plannedRecipeTitle"
                >
                  {{ day.plannedRecipeThumbnail }} {{ day.plannedRecipeTitle }}
                </p>
              </div>
            </div>
            <span
              v-if="day.isToday && !day.isSelected"
              class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-300"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
      <div class="mt-4 grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-end">
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span class="font-medium">{{ t("planner.dayLabel") }}</span>
          <input
            v-model="plannerSelectedDate"
            type="date"
            class="min-h-10 rounded-lg border border-amber-500/35 bg-white px-3 py-2 text-amber-900 outline-none transition-colors focus:border-amber-500 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          />
        </label>
        <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          <span class="font-medium">{{ t("planner.recipeLabel") }}</span>
          <select
            v-model="plannerSelectedRecipeId"
            class="min-h-10 rounded-lg border border-amber-500/35 bg-white px-3 py-2 text-amber-900 outline-none transition-colors focus:border-amber-500 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
          >
            <option disabled value="">{{ t("planner.chooseRecipe") }}</option>
            <option v-for="item in plannerRecipeOptions" :key="item.id" :value="item.id">
              {{ item.thumbnail }} {{ item.title }} - {{ t(`mealType.${item.mealType}`, item.mealType) }}
            </option>
          </select>
        </label>
        <button
          class="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors lg:hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="!plannerSelectedDate || !plannerSelectedRecipeId"
          @click="savePlannerEntry"
        >
          {{ t("planner.savePlan") }}
        </button>
      </div>
    </section>

    <section
      v-if="plannerSelectedDate"
      class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900"
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
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/45 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition-colors lg:hover:bg-amber-100 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
          type="button"
          @click="clearPlannerEntry(plannerSelectedDate)"
        >
          {{ t("planner.clearDay") }}
        </button>
      </div>

      <div
        v-if="selectedDatePlan"
        class="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-white px-3 py-3 dark:bg-zinc-800"
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

    <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
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
            class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/45 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 transition-colors lg:hover:bg-amber-100 dark:border-amber-300/30 dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700"
            type="button"
            @click="clearPlannerEntry(entry.date)"
          >
            {{ t("planner.remove") }}
          </button>
        </div>
      </div>
    </section>
  </section>
</template>
