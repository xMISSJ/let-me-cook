<template>
  <div>
    <main
      class="font-description-preview box-border min-h-dvh bg-amber-100 text-amber-950 dark:bg-zinc-950 dark:text-amber-100"
      :class="isRecipePage ? 'px-0 py-0 pb-24 md:pb-0' : 'px-4 py-8 pb-24 md:px-6 md:pb-8 xl:px-10'"
    >
    <div
      class="mx-auto w-full"
      :class="isRecipePage ? 'max-w-none' : 'grid max-w-7xl gap-4'"
    >
      <p v-if="!isRecipePage && actionError" class="text-xs text-rose-700 dark:text-rose-300">{{ actionError }}</p>
      <div v-if="!isRecipePage">
        <AppHeaderBar
          :active-menu="currentMenu"
          :guest-name="guestName"
          :guest-avatar-src="selectedProfileAvatar.src"
          :guest-avatar-alt="selectedProfileAvatar.alt"
          @navigate="navigateToMenu"
        />
      </div>

      <section
        v-if="recipeLoadError"
        class="rounded-2xl border border-rose-500/40 bg-rose-50 px-5 py-4 text-rose-900 shadow-sm dark:bg-zinc-900 dark:text-rose-100"
      >
        <p class="text-sm font-semibold">{{ t("status.failedToLoadRecipes") }}</p>
        <p class="mt-1 break-words text-sm opacity-90">{{ recipeLoadError }}</p>
        <button
          class="mt-3 inline-flex items-center justify-center cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-zinc-950 lg:hover:bg-rose-400"
          type="button"
          @click="refreshRecipes"
        >
          {{ t("common.retry") }}
        </button>
      </section>

      <template v-if="isRecipePage">
        <section
          v-if="isLoadingRecipes"
          class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-amber-100/95 dark:bg-zinc-950/95"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            :src="loadingSpinnerSrc"
            alt=""
            class="h-16 w-16 animate-spin rounded-full shadow-lg [animation-duration:1.2s]"
            aria-hidden="true"
          />
          <p class="text-sm font-semibold text-amber-900/80 dark:text-amber-100/80">{{ t("status.loadingRecipe") }}</p>
        </section>
        <RecipeDetailCard
          v-else-if="selectedRecipe"
          :recipe="selectedRecipe"
          :can-manage="canManageSelectedRecipe"
          :is-favorite="isFavoriteRecipe(selectedRecipe.id)"
          @back="goToOverview"
          @edit="openEditRecipeModal"
          @delete="removeSelectedRecipe"
          @toggle-favorite="toggleFavoriteRecipe(selectedRecipe.id)"
        />
        <section
          v-else
          class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-6 text-center shadow-sm dark:bg-zinc-900"
        >
          <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ t("details.noneTitle") }}</h2>
          <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
            {{ t("details.noneText") }}
          </p>
          <button
            class="mt-4 inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 lg:hover:bg-amber-400"
            type="button"
            @click="goToOverview"
          >
            {{ t("details.goToOverview") }}
          </button>
        </section>
      </template>
      <Transition name="menu-panel" mode="out-in">
        <section v-if="!isRecipePage && currentMenu === 'overview'" key="menu-overview" class="grid gap-4">
          <OverviewToolbar
            :filtered-count="filteredRecipes.length"
            :total-count="recipes.length"
            @edit-filters="openFilterModal"
          />
          <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
            <div class="min-w-0 grid gap-4">
              <RecipeList
                :recipes="filteredRecipes"
                :favorite-recipe-ids="favoriteRecipeIds"
                :is-loading="isLoadingRecipes"
                :show-no-results="!isLoadingRecipes && recipes.length > 0 && filteredRecipes.length === 0 && hasActiveFilters"
                :no-results-cuisine-label="selectedCuisineLabels.length === 0 ? t('filters.all') : selectedCuisineLabels.join(', ')"
                :no-results-meal-type-label="selectedMealTypeLabels.length === 0 ? t('filters.all') : selectedMealTypeLabels.join(', ')"
                @select-recipe="openRecipe"
                @add-recipe="openAddRecipeModal"
                @edit-recipe="openEditRecipeModalById"
                @delete-recipe="removeRecipeById"
                @toggle-favorite="toggleFavoriteRecipe"
                @clear-filters="clearFilters"
              />
            </div>

            <aside class="hidden min-w-0 h-fit rounded-2xl border border-amber-500/30 bg-amber-50 p-4 shadow-sm md:grid md:gap-4 dark:bg-zinc-900">
              <section class="grid gap-2">
                <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-900/75 dark:text-amber-100/75">{{ t("overview.panelTitle") }}</h3>
              </section>

              <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
                {{ t("overview.showing", { filtered: filteredRecipes.length, total: recipes.length }) }}
              </p>

              <section class="grid gap-2 rounded-xl border border-amber-500/30 bg-white p-3 dark:bg-zinc-800">
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-50">{{ t("overview.activeFiltersTitle") }}</h3>
                <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
                  {{ t("filters.cuisine") }}:
                  <span class="font-semibold">{{ selectedCuisineLabels.length === 0 ? t("filters.all") : selectedCuisineLabels.join(", ") }}</span>
                </p>
                <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
                  {{ t("filters.mealType") }}:
                  <span class="font-semibold">{{ selectedMealTypeLabels.length === 0 ? t("filters.all") : selectedMealTypeLabels.join(", ") }}</span>
                </p>
                <button
                  class="mt-1 inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-[box-shadow,background-color] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-md active:brightness-95 dark:bg-zinc-700 dark:text-amber-100 dark:lg:hover:bg-zinc-600"
                  type="button"
                  @click="openFilterModal"
                >
                  {{ t("overview.editFilters") }}
                </button>
              </section>

              <section class="grid gap-3 rounded-xl border border-amber-500/30 bg-white p-3 dark:bg-zinc-800">
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-50">{{ t("overview.recentPicksTitle") }}</h3>
                <p v-if="recentRecipes.length === 0" class="text-xs text-amber-900/75 dark:text-amber-100/75">
                  {{ t("overview.recentPicksEmpty") }}
                </p>
                <button
                  v-for="recipe in recentRecipes"
                  :key="recipe.id"
                  class="group min-w-0 grid cursor-pointer gap-2 rounded-lg border border-amber-500/30 bg-white/70 px-3 py-2.5 text-left transition-[box-shadow,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 lg:hover:border-amber-400/70 lg:hover:bg-amber-200 lg:hover:shadow-sm lg:hover:shadow-amber-900/10 dark:bg-zinc-800/70 dark:focus-visible:ring-amber-300/60 dark:focus-visible:ring-offset-zinc-800 dark:lg:hover:border-amber-300/50 dark:lg:hover:bg-zinc-700 dark:lg:hover:shadow-black/25"
                  type="button"
                  @click="openRecipe(recipe.id)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-sm font-semibold leading-snug break-words text-amber-900 dark:text-amber-50">
                        {{ recipe.title }}
                      </p>
                      <div class="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-medium text-amber-900/80 dark:text-amber-100/80">
                        <span class="-ml-px rounded-md bg-amber-200/85 px-2 py-0.5 transition-colors duration-200 ease-out group-hover:bg-amber-300 dark:bg-zinc-700 dark:group-hover:bg-zinc-600">
                          {{ t(`cuisine.${recipe.cuisine}`, recipe.cuisine) }}
                        </span>
                        <span class="rounded-md bg-amber-200/85 px-2 py-0.5 transition-colors duration-200 ease-out group-hover:bg-amber-300 dark:bg-zinc-700 dark:group-hover:bg-zinc-600">
                          {{ t(`mealType.${recipe.mealType}`, recipe.mealType) }}
                        </span>
                      </div>
                    </div>
                    <span class="shrink-0 text-base opacity-80">{{ recipe.thumbnail || "🍽️" }}</span>
                  </div>

                  <div class="flex items-center justify-between gap-3 text-[11px] text-amber-900/80 dark:text-amber-100/80">
                    <span class="inline-flex items-center gap-1 font-semibold text-amber-900/75 dark:text-amber-100/75">
                      {{ t("common.open") }}
                      <span class="inline-block transition-transform duration-200 ease-out lg:group-hover:translate-x-0.5" aria-hidden="true">→</span>
                    </span>
                    <div class="flex items-center gap-3">
                    <span>{{ recipe.cookTimeMinutes }} min</span>
                    <span>{{ t("common.servingsCount", { count: recipe.servings }) }}</span>
                    </div>
                  </div>

                </button>
              </section>

            </aside>
          </div>
        </section>

        <section v-else-if="!isRecipePage && currentMenu === 'favorites'" key="menu-favorites" class="grid gap-4">
          <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ t("favorites.title") }}</h2>
                <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
                  {{ t("favorites.subtitle") }}
                </p>
              </div>
              <button
                class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-[box-shadow,background-color] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-700 dark:text-amber-100 dark:lg:hover:bg-zinc-600"
                type="button"
                @click="navigateToMenu('overview')"
              >
                {{ t("favorites.browseAll") }}
              </button>
            </div>
            <section
              v-if="favoriteRecipes.length === 0"
              class="mt-4 rounded-xl border border-amber-500/30 bg-white px-5 py-6 text-center dark:bg-zinc-800"
            >
              <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-50">{{ t("favorites.emptyTitle") }}</h3>
              <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
                {{ t("favorites.emptyText") }}
              </p>
            </section>

            <RecipeList
              v-else
              class="mt-4"
              :recipes="favoriteRecipes"
              :favorite-recipe-ids="favoriteRecipeIds"
              :embedded="true"
              @select-recipe="openRecipe"
              @add-recipe="openAddRecipeModal"
              @edit-recipe="openEditRecipeModalById"
              @delete-recipe="removeRecipeById"
              @toggle-favorite="toggleFavoriteRecipe"
            />
          </section>
        </section>

        <PlannerPanel
          v-else-if="!isRecipePage && currentMenu === 'planner'"
          key="menu-planner"
          :recipes="recipes"
          @open-recipe="openRecipe"
        />

        <ProfilePanel
          v-else-if="!isRecipePage && currentMenu === 'profile'"
          key="menu-profile"
          :profile-heading="profileHeading"
          :selected-profile-avatar="selectedProfileAvatar"
          :profile-avatar-options="PROFILE_AVATAR_OPTIONS"
          :pending-profile-avatar="pendingProfileAvatar"
          :pending-guest-name="pendingGuestName"
          :locale="locale"
          :language-items="languageItems"
          :theme="theme"
          @update:pending-guest-name="pendingGuestName = $event"
          @select-profile-avatar="selectProfileAvatar"
          @save-guest-name="saveGuestName"
          @set-language="setLanguage"
          @toggle-theme="toggleTheme"
        />
      </Transition>
    </div>

    <div v-if="!isRecipePage" class="fixed right-6 bottom-8 z-40 hidden lg:block">
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
          @click="dismissSettingsMascot"
        >
          <span
            class="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-amber-500/35 bg-amber-50/95 dark:border-amber-300/25 dark:bg-zinc-900/95"
            aria-hidden="true"
          />
          <div class="flex items-center gap-2">
            <span class="text-xl [animation:bobble_1.8s_ease-in-out_infinite]">🐻‍❄️</span>
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
          color="neutral"
          variant="ghost"
          :highlight="false"
          class="w-full"
          :ui="desktopQuickSettingsSelectUi"
          @update:model-value="setLanguage"
        />
        <div class="mt-2 h-9 flex items-center justify-between rounded-lg border border-amber-500/20 bg-transparent px-2 py-1.5 dark:border-amber-300/15 dark:bg-transparent">
          <span class="font-sans text-sm font-normal text-amber-900/90 dark:text-amber-100/90">{{ t("profile.darkThemeLabel") }}</span>
          <label class="relative inline-flex h-7 w-fit cursor-pointer items-center">
            <input
              class="peer sr-only"
              type="checkbox"
              :checked="theme === 'dark'"
              :aria-label="t('profile.toggleDarkThemeAria')"
              @change="toggleTheme"
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
        @click="toggleDesktopSettings"
      >
        {{ t("profile.settingsTitle") }}
      </button>
    </div>

    <FilterModal
      :is-open="isFilterModalOpen"
      :cuisine-options="cuisineOptions"
      :meal-type-options="mealTypeOptions"
      :selected-cuisine="selectedCuisine"
      :selected-meal-type="selectedMealType"
      @close="closeFilterModal"
      @clear="clearFilters"
      @apply="applyFilters"
      @update:selected-cuisine="selectedCuisine = $event"
      @update:selected-meal-type="selectedMealType = $event"
    />

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-[60] flex items-stretch justify-center bg-amber-100 p-0 dark:bg-zinc-950 sm:items-center sm:bg-black/70 sm:p-4"
      @click.self="closeAddRecipeModal"
      @keydown.capture="stopModalClipboardShortcuts"
    >
      <div class="h-dvh w-full overflow-y-auto sm:h-auto sm:w-full sm:max-w-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
        <AddRecipeForm @save-recipe="addRecipe" @cancel="closeAddRecipeModal" />
      </div>
    </div>

    <div
      v-if="isEditModalOpen && editingRecipe"
      class="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      @click.self="closeEditRecipeModal"
      @keydown.capture="stopModalClipboardShortcuts"
    >
      <div class="h-dvh w-full overflow-y-auto sm:h-auto sm:w-full sm:max-w-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
        <AddRecipeForm
          :initial-recipe="editingRecipe"
          submit-label="Save Recipe"
          @save-recipe="saveEditedRecipe"
          @cancel="closeEditRecipeModal"
        />
      </div>
    </div>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddRecipeForm from "./components/AddRecipeForm.vue";
import AppHeaderBar from "./components/AppHeaderBar.vue";
import FilterModal from "./components/FilterModal.vue";
import OverviewToolbar from "./components/OverviewToolbar.vue";
import PlannerPanel from "./components/PlannerPanel.vue";
import ProfilePanel from "./components/ProfilePanel.vue";
import RecipeDetailCard from "./components/RecipeDetailCard.vue";
import RecipeList from "./components/RecipeList.vue";
import {
  backfillMissingRecipeImages,
  createRecipe,
  deleteRecipe,
  fetchRecipeImageFromSpoonacular,
  listRecipes,
  seedRecipesIfEmpty,
  updateRecipe,
  uploadRecipeImage,
} from "./data/recipesDb";
import { isSupabaseConfigured } from "./data/supabaseClient";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const recipes = ref([]);
const isLoadingRecipes = ref(true);
const recipeLoadError = ref("");
const actionError = ref("");
const theme = ref("dark");
const guestName = ref("");
const pendingGuestName = ref("");
const PROFILE_AVATAR_OPTIONS = [
  {
    id: "cute-chef-1",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=ChefMia&backgroundColor=fde68a,fbcfe8,c4b5fd",
    alt: "Cute chef avatar 1",
  },
  {
    id: "cute-chef-2",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=RosyChefMina&backgroundColor=bae6fd,bbf7d0,f9a8d4",
    alt: "Cute chef avatar 2",
  },
  {
    id: "cute-chef-3",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=PastryPixie&backgroundColor=fed7aa,fde68a,ddd6fe",
    alt: "Cute chef avatar 3",
  },
  {
    id: "cute-chef-4",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=FoodieFae&backgroundColor=bfdbfe,fbcfe8,bbf7d0",
    alt: "Cute chef avatar 4",
  },
  {
    id: "cute-chef-5",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=CupcakeChef&backgroundColor=fce7f3,fde68a,c7d2fe",
    alt: "Cute chef avatar 5",
  },
  {
    id: "cute-chef-6",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=SoupSprite&backgroundColor=bae6fd,fed7aa,d9f99d",
    alt: "Cute chef avatar 6",
  },
  {
    id: "cute-chef-7",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=StrawberryChefYuna&backgroundColor=fbcfe8,f9a8d4,ddd6fe",
    alt: "Cute chef avatar 7",
  },
  {
    id: "cute-chef-8",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=SunnySousAri&backgroundColor=ddd6fe,bbf7d0,fecaca",
    alt: "Cute chef avatar 8",
  },
  {
    id: "cute-chef-9",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=ChefLuna&backgroundColor=fde68a,bfdbfe,fbcfe8",
    alt: "Cute chef avatar 9",
  },
  {
    id: "cute-chef-10",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=PeachChefNia&backgroundColor=bbf7d0,c7d2fe,fed7aa",
    alt: "Cute chef avatar 10",
  },
  {
    id: "cute-chef-11",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=WhiskWren&backgroundColor=fbcfe8,bae6fd,fde68a",
    alt: "Cute chef avatar 11",
  },
  {
    id: "cute-chef-12",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=HoneyChefAiko&backgroundColor=fbcfe8,bfdbfe,fde68a",
    alt: "Cute chef avatar 12",
  },
];
const DEFAULT_PROFILE_AVATAR_ID = PROFILE_AVATAR_OPTIONS[0].id;
const profileAvatar = ref(DEFAULT_PROFILE_AVATAR_ID);
const pendingProfileAvatar = ref(DEFAULT_PROFILE_AVATAR_ID);
const selectedProfileAvatar = computed(
  () => PROFILE_AVATAR_OPTIONS.find((avatar) => avatar.id === profileAvatar.value) ?? PROFILE_AVATAR_OPTIONS[0],
);

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingRecipeId = ref(null);
const isFilterModalOpen = ref(false);
const isDesktopSettingsOpen = ref(false);
const showSettingsMascot = ref(false);
let mascotAutoHideTimer = null;
const selectedCuisine = ref([]);
const selectedMealType = ref([]);
const recentRecipeIds = ref([]);
const favoriteRecipeIds = ref([]);

const selectedRecipe = computed(() =>
  recipes.value.find((recipe) => String(recipe.id) === String(route.params.id)),
);
const isRecipePage = computed(() => route.path.startsWith("/recipe/"));
const currentMenu = computed(() => {
  if (route.path === "/") return "overview";
  if (route.path.startsWith("/favorites")) return "favorites";
  if (route.path.startsWith("/planner")) return "planner";
  if (route.path.startsWith("/profile")) return "profile";
  return null;
});
const DEFAULT_CUISINES = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "French",
  "Thai",
  "Mediterranean",
  "Spanish",
  "Greek",
  "Korean",
  "Middle Eastern",
  "Vietnamese",
  "Turkish",
  "Lebanese",
  "American",
  "International",
];
const cuisineOptions = computed(() => {
  const normalizedDefaults = new Map(DEFAULT_CUISINES.map((cuisine) => [cuisine.toLowerCase(), cuisine]));
  const discoveredCuisines = new Map();
  recipes.value.forEach((recipe) => {
    const rawCuisine = String(recipe?.cuisine ?? "").trim();
    if (!rawCuisine) return;
    const lower = rawCuisine.toLowerCase();
    discoveredCuisines.set(lower, normalizedDefaults.get(lower) || rawCuisine);
  });
  const merged = [
    ...DEFAULT_CUISINES,
    ...[...discoveredCuisines.values()].filter((cuisine) => !DEFAULT_CUISINES.includes(cuisine)),
  ];
  return ["All", ...merged];
});
const DEFAULT_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const mealTypeOptions = computed(() => {
  const normalizedDefaults = new Map(DEFAULT_MEAL_TYPES.map((type) => [type.toLowerCase(), type]));
  const discoveredTypes = new Map();
  recipes.value.forEach((recipe) => {
    const rawType = String(recipe?.mealType ?? "").trim();
    if (!rawType) return;
    const lower = rawType.toLowerCase();
    discoveredTypes.set(lower, normalizedDefaults.get(lower) || rawType);
  });
  const merged = [...DEFAULT_MEAL_TYPES, ...[...discoveredTypes.values()].filter((type) => !DEFAULT_MEAL_TYPES.includes(type))];
  return ["All", ...merged];
});
const filteredRecipes = computed(() =>
  recipes.value.filter((recipe) => {
    const cuisineMatch =
      selectedCuisine.value.length === 0 || selectedCuisine.value.includes(recipe.cuisine);
    const mealTypeMatch =
      selectedMealType.value.length === 0 || selectedMealType.value.includes(recipe.mealType);
    return cuisineMatch && mealTypeMatch;
  }),
);
const hasActiveFilters = computed(() => selectedCuisine.value.length > 0 || selectedMealType.value.length > 0);
const selectedCuisineLabels = computed(() =>
  selectedCuisine.value.map((cuisine) => t(`cuisine.${cuisine}`, cuisine)),
);
const selectedMealTypeLabels = computed(() =>
  selectedMealType.value.map((mealType) => t(`mealType.${mealType}`, mealType)),
);
const recentRecipes = computed(() => {
  const recipesById = new Map(recipes.value.map((recipe) => [String(recipe.id), recipe]));
  return recentRecipeIds.value
    .map((id) => recipesById.get(String(id)))
    .filter((recipe) => Boolean(recipe))
    .slice(0, 3);
});
const favoriteRecipes = computed(() => {
  const favoriteIdSet = new Set(favoriteRecipeIds.value.map((id) => String(id)));
  return recipes.value.filter((recipe) => favoriteIdSet.has(String(recipe.id)));
});
const languageItems = [
  { label: "English", value: "en" },
  { label: "Nederlands", value: "nl" },
  { label: "中文", value: "zh" },
];
const desktopQuickSettingsSelectUi = {
  base: 'h-9 rounded-md border border-amber-500/20 bg-transparent px-2 py-1.5 text-xs text-amber-900 shadow-none transition-colors hover:border-amber-500/35 hover:bg-amber-100/40 focus-visible:ring-1 focus-visible:ring-amber-500/30 data-[state=open]:border-amber-500/35 data-[state=open]:bg-amber-100/40 dark:border-amber-300/15 dark:text-amber-100 dark:hover:border-amber-300/25 dark:hover:bg-zinc-800/70 dark:focus-visible:ring-amber-300/25 dark:data-[state=open]:border-amber-300/25 dark:data-[state=open]:bg-zinc-800/70',
  trailingIcon: 'text-amber-800/70 dark:text-amber-100/70',
  value: 'text-amber-900/90 dark:text-amber-100/90',
  placeholder: 'text-amber-900/55 dark:text-amber-100/55',
  content: 'rounded-xl border border-amber-500/25 bg-amber-50 p-1 shadow-lg shadow-amber-900/10 dark:border-amber-300/20 dark:bg-zinc-900 dark:shadow-black/35',
  item: 'rounded-lg text-amber-900/90 hover:bg-amber-100 dark:text-amber-100/90 dark:hover:bg-zinc-800 data-highlighted:not-data-disabled:bg-amber-100 dark:data-highlighted:not-data-disabled:bg-zinc-800',
};
const activeEditorName = computed(() => guestName.value.trim() || t("common.guest"));
const profileHeading = computed(() => {
  const normalizedName = guestName.value.trim();
  const localizedProfileWordByLocale = {
    en: "profile",
    nl: "profiel",
    zh: "个人资料",
  };
  const activeLocale = String(locale.value).split("-")[0];
  const localizedProfileWord = localizedProfileWordByLocale[activeLocale] ?? "profile";
  if (!normalizedName) {
    return localizedProfileWord.charAt(0).toUpperCase() + localizedProfileWord.slice(1);
  }
  const capitalizedName = normalizedName.replace(/\b([a-z])/gi, (letter) => letter.toUpperCase());
  if (activeLocale === "zh") {
    return `${capitalizedName}的${localizedProfileWord}`;
  }
  return `${capitalizedName}'s ${localizedProfileWord}`;
});
const editingRecipe = computed(() =>
  recipes.value.find((recipe) => recipe.id === editingRecipeId.value) ?? null,
);
const canManageSelectedRecipe = computed(() => canManageRecipe(selectedRecipe.value));
const loadingSpinnerSrc = `${import.meta.env.BASE_URL}favicon.svg`;

function canManageRecipe(recipe) {
  return Boolean(recipe);
}

function isFavoriteRecipe(recipeId) {
  return favoriteRecipeIds.value.some((id) => String(id) === String(recipeId));
}

function toggleFavoriteRecipe(recipeId) {
  if (isFavoriteRecipe(recipeId)) {
    favoriteRecipeIds.value = favoriteRecipeIds.value.filter((id) => String(id) !== String(recipeId));
  } else {
    favoriteRecipeIds.value = [recipeId, ...favoriteRecipeIds.value.filter((id) => String(id) !== String(recipeId))];
  }
  localStorage.setItem("let-me-cook-favorite-recipe-ids", JSON.stringify(favoriteRecipeIds.value));
}

async function refreshRecipes() {
  isLoadingRecipes.value = true;
  recipeLoadError.value = "";
  try {
    await seedRecipesIfEmpty();
    recipes.value = await listRecipes();
    const updatedCount = await backfillMissingRecipeImages(12);
    if (updatedCount > 0) {
      recipes.value = await listRecipes();
    }
  } catch (error) {
    console.warn("Unable to load recipes", error);
    recipeLoadError.value = "Please try again.";
  } finally {
    isLoadingRecipes.value = false;
  }
}

onMounted(() => {
  guestName.value = localStorage.getItem("let-me-cook-guest-name") ?? "";
  pendingGuestName.value = guestName.value;
  const storedAvatar = localStorage.getItem("let-me-cook-profile-avatar");
  const hasStoredAvatar = PROFILE_AVATAR_OPTIONS.some((avatar) => avatar.id === storedAvatar);
  profileAvatar.value = hasStoredAvatar ? storedAvatar : DEFAULT_PROFILE_AVATAR_ID;
  pendingProfileAvatar.value = profileAvatar.value;
  theme.value = localStorage.getItem("let-me-cook-theme") ?? "dark";
  locale.value = localStorage.getItem("let-me-cook-language") ?? locale.value;
  const storedRecentIds = localStorage.getItem("let-me-cook-recent-recipe-ids");
  if (storedRecentIds) {
    try {
      const parsed = JSON.parse(storedRecentIds);
      recentRecipeIds.value = Array.isArray(parsed) ? parsed : [];
    } catch {
      recentRecipeIds.value = [];
    }
  }
  const storedFavoriteIds = localStorage.getItem("let-me-cook-favorite-recipe-ids");
  if (storedFavoriteIds) {
    try {
      const parsed = JSON.parse(storedFavoriteIds);
      favoriteRecipeIds.value = Array.isArray(parsed) ? parsed : [];
    } catch {
      favoriteRecipeIds.value = [];
    }
  }
  document.documentElement.classList.toggle("dark", theme.value === "dark");
  updateBrowserThemeColor();

  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not fully configured.");
  }

  showSettingsMascot.value = true;
  mascotAutoHideTimer = window.setTimeout(() => {
    showSettingsMascot.value = false;
  }, 4200);

  void refreshRecipes();
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  },
);

function openRecipe(recipeId) {
  isDesktopSettingsOpen.value = false;
  recentRecipeIds.value = [recipeId, ...recentRecipeIds.value.filter((id) => id !== recipeId)].slice(0, 3);
  localStorage.setItem("let-me-cook-recent-recipe-ids", JSON.stringify(recentRecipeIds.value));
  router.push(`/recipe/${recipeId}`);
}

function goToOverview() {
  isDesktopSettingsOpen.value = false;
  router.push("/");
}

function navigateToMenu(menu) {
  isDesktopSettingsOpen.value = false;
  showSettingsMascot.value = false;
  if (menu === "planner") {
    router.push("/planner");
    return;
  }
  if (menu === "profile") {
    router.push("/profile");
    return;
  }
  if (menu === "favorites") {
    router.push("/favorites");
    return;
  }
  router.push("/");
}

function openAddRecipeModal() {
  actionError.value = "";
  isAddModalOpen.value = true;
}

function closeAddRecipeModal() {
  isAddModalOpen.value = false;
}

function openFilterModal() {
  isFilterModalOpen.value = true;
}

function closeFilterModal() {
  isFilterModalOpen.value = false;
}

function dismissSettingsMascot() {
  showSettingsMascot.value = false;
}

function toggleDesktopSettings() {
  showSettingsMascot.value = false;
  isDesktopSettingsOpen.value = !isDesktopSettingsOpen.value;
}

function clearFilters() {
  selectedCuisine.value = [];
  selectedMealType.value = [];
}

function inferRecipeEmoji(recipe, fallback = "🍽️") {
  const text = [recipe?.title, recipe?.description, ...(Array.isArray(recipe?.ingredients) ? recipe.ingredients : [])]
    .join(" ")
    .toLowerCase();
  const cuisine = String(recipe?.cuisine ?? "").toLowerCase();

  const keywordEmojiPairs = [
    [["pasta", "spaghetti", "lasagna", "ravioli"], "🍝"],
    [["pizza", "flatbread"], "🍕"],
    [["burger", "hamburger", "cheeseburger"], "🍔"],
    [["sandwich", "toastie", "panini"], "🥪"],
    [["taco", "burrito", "quesadilla", "nacho"], "🌮"],
    [["ramen", "noodle", "udon", "pho"], "🍜"],
    [["soup", "broth", "stew"], "🍲"],
    [["rice", "risotto", "paella", "bowl"], "🍚"],
    [["salad", "lettuce", "greens"], "🥗"],
    [["egg", "omelette"], "🍳"],
    [["chicken", "turkey"], "🍗"],
    [["beef", "steak"], "🥩"],
    [["fish", "salmon", "tuna", "cod"], "🐟"],
    [["shrimp", "prawn"], "🦐"],
    [["bread", "bagel", "bun"], "🍞"],
    [["cake", "cupcake"], "🍰"],
    [["cookie", "biscuit"], "🍪"],
    [["ice cream", "gelato"], "🍨"],
    [["chocolate", "brownie"], "🍫"],
    [["fruit", "apple", "banana", "berry"], "🍓"],
    [["potato", "fries"], "🥔"],
    [["dumpling", "gyoza", "wonton"], "🥟"],
    [["curry"], "🍛"],
    [["sushi"], "🍣"],
  ];

  for (const [keywords, emoji] of keywordEmojiPairs) {
    if (keywords.some((keyword) => text.includes(keyword))) return emoji;
  }

  const cuisineEmojiMap = {
    italian: "🍝",
    japanese: "🍣",
    chinese: "🥢",
    mexican: "🌮",
    indian: "🍛",
    thai: "🍜",
    french: "🥖",
    korean: "🍲",
    greek: "🥙",
    spanish: "🥘",
    mediterranean: "🥙",
    vietnamese: "🍜",
    turkish: "🥙",
    lebanese: "🥙",
    american: "🍔",
  };

  return cuisineEmojiMap[cuisine] || fallback;
}

async function addRecipe(recipe) {
  actionError.value = "";
  let imageUrl = "";
  if (recipe.imageFile) {
    imageUrl = await uploadRecipeImage(recipe.imageFile, null);
  } else {
    imageUrl = await fetchRecipeImageFromSpoonacular(recipe);
  }
  const created = await createRecipe({
    thumbnail: inferRecipeEmoji(recipe),
    ...recipe,
    userId: null,
    imageUrl,
    editorName: activeEditorName.value,
  });
  recipes.value.unshift(created);
  router.push("/");
  closeAddRecipeModal();
}

function openEditRecipeModal() {
  if (!selectedRecipe.value || !canManageSelectedRecipe.value) {
    actionError.value = t("errors.onlyOwnerOrAdminEdit");
    return;
  }
  editingRecipeId.value = selectedRecipe.value.id;
  isEditModalOpen.value = true;
}

function openEditRecipeModalById(recipeId) {
  const targetRecipe = recipes.value.find((recipe) => String(recipe.id) === String(recipeId));
  if (!targetRecipe || !canManageRecipe(targetRecipe)) {
    actionError.value = t("errors.onlyOwnerOrAdminEdit");
    return;
  }
  actionError.value = "";
  editingRecipeId.value = targetRecipe.id;
  isEditModalOpen.value = true;
}

function closeEditRecipeModal() {
  isEditModalOpen.value = false;
  editingRecipeId.value = null;
}

async function saveEditedRecipe(recipe) {
  if (!editingRecipe.value) return;
  actionError.value = "";
  let imageUrl = editingRecipe.value.imageUrl ?? "";
  if (recipe.imageFile) {
    imageUrl = await uploadRecipeImage(recipe.imageFile, null);
  } else if (!imageUrl) {
    imageUrl = await fetchRecipeImageFromSpoonacular(recipe);
  }
  const updated = await updateRecipe(editingRecipe.value.id, {
    ...recipe,
    thumbnail: inferRecipeEmoji(recipe, editingRecipe.value.thumbnail || "🍽️"),
    imageUrl,
  });
  recipes.value = recipes.value.map((item) => (item.id === updated.id ? updated : item));
  closeEditRecipeModal();
}

async function removeRecipeById(recipeId) {
  const targetRecipe = recipes.value.find((recipe) => String(recipe.id) === String(recipeId));
  if (!targetRecipe || !canManageRecipe(targetRecipe)) {
    actionError.value = t("errors.onlyOwnerOrAdminDelete");
    return;
  }
  const shouldDelete = window.confirm(t("confirm.deleteRecipe"));
  if (!shouldDelete) return;
  await deleteRecipe(targetRecipe.id);
  recipes.value = recipes.value.filter((recipe) => recipe.id !== targetRecipe.id);
  recentRecipeIds.value = recentRecipeIds.value.filter((id) => id !== targetRecipe.id);
  favoriteRecipeIds.value = favoriteRecipeIds.value.filter((id) => id !== targetRecipe.id);
  localStorage.setItem("let-me-cook-recent-recipe-ids", JSON.stringify(recentRecipeIds.value));
  localStorage.setItem("let-me-cook-favorite-recipe-ids", JSON.stringify(favoriteRecipeIds.value));
  if (String(route.params.id) === String(targetRecipe.id)) {
    router.push("/");
  }
}

async function removeSelectedRecipe() {
  if (!selectedRecipe.value) return;
  await removeRecipeById(selectedRecipe.value.id);
}

function saveGuestName() {
  const normalized = pendingGuestName.value.trim();
  guestName.value = normalized;
  if (normalized) {
    localStorage.setItem("let-me-cook-guest-name", normalized);
    return;
  }
  localStorage.removeItem("let-me-cook-guest-name");
}

function selectProfileAvatar(avatarId) {
  pendingProfileAvatar.value = avatarId;
  profileAvatar.value = avatarId;
  localStorage.setItem("let-me-cook-profile-avatar", avatarId);
}

function applyFilters() {
  closeFilterModal();
}

function syncBodyScrollLock() {
  const hasOpenModal = isAddModalOpen.value || isEditModalOpen.value || isFilterModalOpen.value;
  if (hasOpenModal) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
}

function stopModalClipboardShortcuts(event) {
  const isClipboardShortcut =
    (event.ctrlKey || event.metaKey) && ["c", "x", "v", "a"].includes(String(event.key).toLowerCase());
  if (isClipboardShortcut) {
    event.stopPropagation();
  }
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("let-me-cook-theme", theme.value);
  document.documentElement.classList.toggle("dark", theme.value === "dark");
  updateBrowserThemeColor();
}

function setLanguage(value) {
  locale.value = value;
  localStorage.setItem("let-me-cook-language", value);
}

function updateBrowserThemeColor() {
  const color = getComputedStyle(document.documentElement).getPropertyValue("--app-chrome-color").trim();
  if (!color) return;
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute("content", color);
}

watch([isAddModalOpen, isEditModalOpen, isFilterModalOpen], () => {
  syncBodyScrollLock();
});

onBeforeUnmount(() => {
  if (mascotAutoHideTimer) {
    window.clearTimeout(mascotAutoHideTimer);
  }
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});
</script>

<style scoped>
.menu-panel-enter-active,
.menu-panel-leave-active {
  transition:
    opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.menu-panel-enter-from,
.menu-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes bobble {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
</style>
