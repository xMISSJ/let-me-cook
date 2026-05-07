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
        <OverviewPanel
          v-if="!isRecipePage && currentMenu === 'overview'"
          key="menu-overview"
          :filtered-recipes="filteredRecipes"
          :recipes="recipes"
          :favorite-recipe-ids="favoriteRecipeIds"
          :is-loading-recipes="isLoadingRecipes"
          :has-active-filters="hasActiveFilters"
          :selected-cuisine-labels="selectedCuisineLabels"
          :selected-meal-type-labels="selectedMealTypeLabels"
          :recent-recipes="recentRecipes"
          @open-filter-modal="openFilterModal"
          @open-recipe="openRecipe"
          @open-add-recipe-modal="openAddRecipeModal"
          @open-edit-recipe-modal-by-id="openEditRecipeModalById"
          @remove-recipe-by-id="removeRecipeById"
          @toggle-favorite-recipe="toggleFavoriteRecipe"
          @clear-filters="clearFilters"
        />

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

    <DesktopSettingsFab
      v-if="!isRecipePage"
      :locale="locale"
      :language-items="languageItems"
      :theme="theme"
      :show-settings-mascot="showSettingsMascot"
      :is-desktop-settings-open="isDesktopSettingsOpen"
      @dismiss-settings-mascot="dismissSettingsMascot"
      @set-language="setLanguage"
      @toggle-theme="toggleTheme"
      @toggle-desktop-settings="toggleDesktopSettings"
    />

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
      class="fixed inset-0 z-[60] overflow-y-auto bg-amber-100 dark:bg-zinc-950 sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:bg-black/70 sm:p-4"
      @click.self="closeAddRecipeModal"
      @keydown.capture="stopModalClipboardShortcuts"
    >
      <div class="w-full sm:w-full sm:max-w-2xl sm:rounded-2xl sm:overflow-hidden">
        <div class="sm:max-h-[calc(100dvh-2rem)] sm:overflow-y-auto">
        <AddRecipeForm @save-recipe="addRecipe" @cancel="closeAddRecipeModal" />
        </div>
      </div>
    </div>

    <div
      v-if="isEditModalOpen && editingRecipe"
      class="fixed inset-0 z-[60] overflow-y-auto bg-amber-100 dark:bg-zinc-950 sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:bg-black/70 sm:p-4"
      @click.self="closeEditRecipeModal"
      @keydown.capture="stopModalClipboardShortcuts"
    >
      <div class="w-full sm:w-full sm:max-w-2xl sm:rounded-2xl sm:overflow-hidden">
        <div class="sm:max-h-[calc(100dvh-2rem)] sm:overflow-y-auto">
        <AddRecipeForm
          :initial-recipe="editingRecipe"
          submit-label="Save Recipe"
          @save-recipe="saveEditedRecipe"
          @cancel="closeEditRecipeModal"
        />
        </div>
      </div>
    </div>
    </main>
    <Transition
      enter-active-class="transition-all duration-250 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showRealtimeSyncToast"
        class="pointer-events-none fixed right-4 bottom-4 z-[70] rounded-lg border border-emerald-500/30 bg-emerald-50/95 px-3 py-2 text-xs font-semibold text-emerald-900 shadow-md dark:border-emerald-300/30 dark:bg-zinc-900/95 dark:text-emerald-200"
        role="status"
        aria-live="polite"
      >
        Recipes synced across devices
      </div>
    </Transition>
    <Transition
      enter-active-class="transition-all duration-250 ease-out"
      enter-from-class="opacity-0 -translate-y-2 md:translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1 md:translate-y-1"
    >
      <div
        v-if="actionError"
        class="fixed inset-x-4 top-4 z-[80] rounded-lg border border-rose-500/40 bg-rose-50/95 px-3 py-2 text-sm font-medium text-rose-900 shadow-md backdrop-blur dark:border-rose-300/35 dark:bg-zinc-900/95 dark:text-rose-200 md:inset-x-auto md:right-4 md:top-auto md:bottom-4 md:w-[24rem]"
        role="alert"
        aria-live="assertive"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="min-w-0 break-words">{{ actionError }}</p>
          <button
            class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-rose-500/45 bg-white text-rose-700 hover:bg-rose-100 dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
            type="button"
            :aria-label="t('common.close')"
            @click="clearActionError"
          >
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddRecipeForm from "./components/AddRecipeForm.vue";
import AppHeaderBar from "./components/AppHeaderBar.vue";
import DesktopSettingsFab from "./components/DesktopSettingsFab.vue";
import FilterModal from "./components/FilterModal.vue";
import OverviewPanel from "./components/OverviewPanel.vue";
import PlannerPanel from "./components/PlannerPanel.vue";
import ProfilePanel from "./components/ProfilePanel.vue";
import RecipeDetailCard from "./components/RecipeDetailCard.vue";
import RecipeList from "./components/RecipeList.vue";
import { useRecipeFilters } from "./composables/useRecipeFilters";
import { DEFAULT_PROFILE_AVATAR_ID, PROFILE_AVATAR_OPTIONS } from "./constants/profileAvatars";
import {
  backfillMissingRecipeImages,
  createRecipe,
  deleteRecipe,
  fetchRecipeImageFromSpoonacular,
  isUserProvidedRecipeImage,
  listRecipes,
  seedRecipesIfEmpty,
  updateRecipe,
  uploadRecipeImage,
} from "./data/recipesDb";
import { getSupabaseClient, isSupabaseConfigured } from "./data/supabaseClient";
import { buildProfileHeading } from "./utils/profileDisplay";
import { inferRecipeEmoji } from "./utils/recipeDisplay";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const recipes = ref([]);
const isLoadingRecipes = ref(true);
const recipeLoadError = ref("");
const actionError = ref("");
const showRealtimeSyncToast = ref(false);
const theme = ref("dark");
const guestName = ref("");
const pendingGuestName = ref("");
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
const { cuisineOptions, mealTypeOptions, filteredRecipes, hasActiveFilters, selectedCuisineLabels, selectedMealTypeLabels } =
  useRecipeFilters({ recipes, selectedCuisine, selectedMealType, t });
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
const activeEditorName = computed(() => guestName.value.trim() || t("common.guest"));
const profileHeading = computed(() => buildProfileHeading(guestName.value, locale.value));
const editingRecipe = computed(() =>
  recipes.value.find((recipe) => recipe.id === editingRecipeId.value) ?? null,
);
const canManageSelectedRecipe = computed(() => canManageRecipe(selectedRecipe.value));
const loadingSpinnerSrc = `${import.meta.env.BASE_URL}favicon.svg`;
let recipesRealtimeChannel = null;
let recipesRealtimeRefreshTimer = null;
let realtimeSyncToastTimer = null;
let actionErrorToastTimer = null;

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

function scheduleRealtimeRecipesRefresh() {
  if (recipesRealtimeRefreshTimer) return;
  recipesRealtimeRefreshTimer = window.setTimeout(() => {
    recipesRealtimeRefreshTimer = null;
    showRealtimeSyncToast.value = true;
    if (realtimeSyncToastTimer) {
      window.clearTimeout(realtimeSyncToastTimer);
    }
    realtimeSyncToastTimer = window.setTimeout(() => {
      showRealtimeSyncToast.value = false;
      realtimeSyncToastTimer = null;
    }, 2200);
    void refreshRecipes();
  }, 250);
}

function subscribeToRecipeRealtimeChanges() {
  if (!isSupabaseConfigured() || recipesRealtimeChannel) return;
  try {
    const supabase = getSupabaseClient();
    recipesRealtimeChannel = supabase
      .channel("public:recipes:changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recipes" },
        () => {
          scheduleRealtimeRecipesRefresh();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Recipe realtime channel error");
        }
      });
  } catch (error) {
    console.warn("Unable to subscribe to recipe realtime updates", error);
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
  subscribeToRecipeRealtimeChanges();
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

function clearActionError() {
  actionError.value = "";
}

async function addRecipe(recipe) {
  actionError.value = "";
  try {
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
  } catch (error) {
    console.warn("Unable to add recipe", error);
    actionError.value = "Could not save recipe. Please try again.";
  }
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
  try {
    let imageUrl = editingRecipe.value.imageUrl ?? "";
    const previousTitle = String(editingRecipe.value.title ?? "").trim().toLowerCase();
    const nextTitle = String(recipe.title ?? "").trim().toLowerCase();
    const didTitleChange = previousTitle !== nextTitle;

    if (recipe.imageFile) {
      imageUrl = await uploadRecipeImage(recipe.imageFile, null);
    } else if (recipe.imageRemoved) {
      imageUrl = (await fetchRecipeImageFromSpoonacular(recipe)) || "";
    } else if (!imageUrl) {
      imageUrl = (await fetchRecipeImageFromSpoonacular(recipe)) || "";
    } else if (didTitleChange && !isUserProvidedRecipeImage(imageUrl)) {
      const fetchedImageUrl = await fetchRecipeImageFromSpoonacular(recipe);
      if (fetchedImageUrl) {
        imageUrl = fetchedImageUrl;
      }
    }

    const updated = await updateRecipe(
      editingRecipe.value.id,
      {
        ...recipe,
        thumbnail: inferRecipeEmoji(recipe, editingRecipe.value.thumbnail || "🍽️"),
        imageUrl,
        editorName: activeEditorName.value,
      },
      editingRecipe.value,
    );
    recipes.value = recipes.value.map((item) => (item.id === updated.id ? updated : item));
    closeEditRecipeModal();
  } catch (error) {
    console.warn("Unable to edit recipe", error);
    const reason = error instanceof Error ? error.message : String(error ?? "");
    actionError.value = reason ? `Could not save recipe changes: ${reason}` : "Could not save recipe changes. Please try again.";
  }
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

watch(actionError, (value) => {
  if (actionErrorToastTimer) {
    window.clearTimeout(actionErrorToastTimer);
    actionErrorToastTimer = null;
  }
  if (!value) return;
  actionErrorToastTimer = window.setTimeout(() => {
    actionError.value = "";
    actionErrorToastTimer = null;
  }, 4200);
});

onBeforeUnmount(() => {
  if (mascotAutoHideTimer) {
    window.clearTimeout(mascotAutoHideTimer);
  }
  if (recipesRealtimeRefreshTimer) {
    window.clearTimeout(recipesRealtimeRefreshTimer);
    recipesRealtimeRefreshTimer = null;
  }
  if (realtimeSyncToastTimer) {
    window.clearTimeout(realtimeSyncToastTimer);
    realtimeSyncToastTimer = null;
  }
  if (actionErrorToastTimer) {
    window.clearTimeout(actionErrorToastTimer);
    actionErrorToastTimer = null;
  }
  if (recipesRealtimeChannel && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    supabase.removeChannel(recipesRealtimeChannel);
    recipesRealtimeChannel = null;
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
