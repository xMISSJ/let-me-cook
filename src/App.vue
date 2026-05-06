<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddRecipeForm from "./components/AddRecipeForm.vue";
import AppTabs from "./components/AppTabs.vue";
import FilterModal from "./components/FilterModal.vue";
import OverviewToolbar from "./components/OverviewToolbar.vue";
import RecipeDetailCard from "./components/RecipeDetailCard.vue";
import RecipeHero from "./components/RecipeHero.vue";
import RecipeList from "./components/RecipeList.vue";
import {
  createRecipe,
  deleteRecipe,
  listRecipes,
  seedRecipesIfEmpty,
  updateRecipe,
  uploadRecipeImage,
} from "./data/recipesDb";
import {
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail,
  signOutUser,
} from "./data/supabaseClient";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const recipes = ref([]);
const isLoadingRecipes = ref(true);
const recipeLoadError = ref("");
const actionError = ref("");
const authEmail = ref("");
const authMessage = ref("");
const session = ref(null);
const theme = ref("dark");
const guestName = ref("");
const pendingGuestName = ref("");
const isAuthScreenOpen = ref(false);
const isSettingsOpen = ref(false);

const activeTab = ref("overview");
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingRecipeId = ref(null);
const isFilterModalOpen = ref(false);
const selectedCuisine = ref("All");
const selectedMealType = ref("All");
const recentRecipeIds = ref([]);

const selectedRecipe = computed(() =>
  recipes.value.find((recipe) => String(recipe.id) === String(route.params.id)),
);
const isRecipePage = computed(() => Boolean(route.params.id));
const recentRecipes = computed(() =>
  recentRecipeIds.value
    .map((recipeId) => recipes.value.find((recipe) => recipe.id === recipeId))
    .filter(Boolean)
    .slice(0, 3),
);
const cuisineOptions = computed(() => [
  "All",
  ...new Set(recipes.value.map((recipe) => recipe.cuisine)),
]);
const mealTypeOptions = computed(() => [
  "All",
  ...new Set(recipes.value.map((recipe) => recipe.mealType)),
]);
const filteredRecipes = computed(() =>
  recipes.value.filter((recipe) => {
    const cuisineMatch =
      selectedCuisine.value === "All" || recipe.cuisine === selectedCuisine.value;
    const mealTypeMatch =
      selectedMealType.value === "All" || recipe.mealType === selectedMealType.value;
    return cuisineMatch && mealTypeMatch;
  }),
);
const canManageRecipes = computed(() => Boolean(session.value?.user) || Boolean(guestName.value.trim()));
const activeEditorName = computed(() => session.value?.user?.email || guestName.value.trim() || "Guest");
const editingRecipe = computed(() =>
  recipes.value.find((recipe) => recipe.id === editingRecipeId.value) ?? null,
);

async function refreshRecipes() {
  isLoadingRecipes.value = true;
  recipeLoadError.value = "";
  try {
    await seedRecipesIfEmpty();
    recipes.value = await listRecipes();
  } catch (error) {
    recipeLoadError.value = error instanceof Error ? error.message : String(error);
  } finally {
    isLoadingRecipes.value = false;
  }
}

onMounted(() => {
  guestName.value = localStorage.getItem("let-me-cook-guest-name") ?? "";
  pendingGuestName.value = guestName.value;
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
  document.documentElement.classList.toggle("dark", theme.value === "dark");
  void getCurrentSession().then((value) => {
    session.value = value;
  });
  onAuthStateChange((value) => {
    session.value = value;
  });
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
  recentRecipeIds.value = [recipeId, ...recentRecipeIds.value.filter((id) => id !== recipeId)].slice(0, 3);
  localStorage.setItem("let-me-cook-recent-recipe-ids", JSON.stringify(recentRecipeIds.value));
  router.push({ name: "recipe", params: { id: recipeId } });
}

function goToOverview() {
  router.push({ name: "home" });
  activeTab.value = "overview";
}

function setTab(tab) {
  activeTab.value = tab;
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

function clearFilters() {
  selectedCuisine.value = "All";
  selectedMealType.value = "All";
}

async function addRecipe(recipe) {
  actionError.value = "";
  let imageUrl = "";
  if (recipe.imageFile) {
    imageUrl = await uploadRecipeImage(recipe.imageFile, session.value?.user?.id);
  }
  const created = await createRecipe({
    thumbnail: "🍽️",
    ...recipe,
    imageUrl,
    editorName: activeEditorName.value,
  });
  recipes.value.unshift(created);
  activeTab.value = "overview";
  closeAddRecipeModal();
}

function openEditRecipeModal() {
  if (!selectedRecipe.value || !canManageRecipes.value) return;
  editingRecipeId.value = selectedRecipe.value.id;
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
    imageUrl = await uploadRecipeImage(recipe.imageFile, session.value?.user?.id);
  }
  const updated = await updateRecipe(editingRecipe.value.id, {
    ...recipe,
    imageUrl,
    editorName: activeEditorName.value,
  });
  recipes.value = recipes.value.map((item) => (item.id === updated.id ? updated : item));
  closeEditRecipeModal();
}

async function removeSelectedRecipe() {
  if (!selectedRecipe.value || !canManageRecipes.value) return;
  const shouldDelete = window.confirm("Delete this recipe?");
  if (!shouldDelete) return;
  await deleteRecipe(selectedRecipe.value.id);
  recipes.value = recipes.value.filter((recipe) => recipe.id !== selectedRecipe.value.id);
  recentRecipeIds.value = recentRecipeIds.value.filter((id) => id !== selectedRecipe.value.id);
  localStorage.setItem("let-me-cook-recent-recipe-ids", JSON.stringify(recentRecipeIds.value));
  activeTab.value = "overview";
  router.push({ name: "home" });
}

async function startEmailSignIn() {
  if (!authEmail.value.trim()) return;
  actionError.value = "";
  try {
    await signInWithEmail(authEmail.value.trim());
    authMessage.value = "Check your email for a sign-in link.";
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : String(error);
  }
}

async function handleSignOut() {
  await signOutUser();
  authMessage.value = "";
}

function saveGuestName() {
  const normalized = pendingGuestName.value.trim();
  guestName.value = normalized;
  if (normalized) {
    localStorage.setItem("let-me-cook-guest-name", normalized);
    authMessage.value = `Using app as ${normalized}.`;
  } else {
    localStorage.removeItem("let-me-cook-guest-name");
    authMessage.value = "";
  }
  isAuthScreenOpen.value = false;
}

function applyFilters() {
  closeFilterModal();
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("let-me-cook-theme", theme.value);
  document.documentElement.classList.toggle("dark", theme.value === "dark");
}

function setLanguage(value) {
  locale.value = value;
  localStorage.setItem("let-me-cook-language", value);
}
</script>

<template>
  <main
    class="min-h-screen bg-amber-100 text-amber-950 dark:bg-zinc-950 dark:text-amber-100"
    :class="isRecipePage ? 'px-0 py-0' : 'px-4 py-8'"
  >
    <div class="mx-auto grid w-full gap-4" :class="isRecipePage ? 'max-w-none' : 'max-w-3xl'">
      <div v-if="!isRecipePage" class="flex justify-end">
        <div class="flex flex-wrap items-center justify-end gap-3">
          <button
            class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
            type="button"
            @click="isAuthScreenOpen = true"
          >
            Profile
          </button>
          <button
            class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
            type="button"
            @click="isSettingsOpen = true"
          >
            <svg
              class="mr-1.5 h-4 w-4"
              viewBox="0 0 682.667 682.667"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
                <path
                  d="M0 0c-43.446 0-78.667-35.22-78.667-78.667 0-43.446 35.221-78.666 78.667-78.666 43.446 0 78.667 35.22 78.667 78.666C78.667-35.22 43.446 0 0 0Zm220.802-22.53-21.299-17.534c-24.296-20.001-24.296-57.204 0-77.205l21.299-17.534c7.548-6.214 9.497-16.974 4.609-25.441l-42.057-72.845c-4.889-8.467-15.182-12.159-24.337-8.729l-25.835 9.678c-29.469 11.04-61.688-7.561-66.862-38.602l-4.535-27.213c-1.607-9.643-9.951-16.712-19.727-16.712h-84.116c-9.776 0-18.12 7.069-19.727 16.712l-4.536 27.213c-5.173 31.041-37.392 49.642-66.861 38.602l-25.834-9.678c-9.156-3.43-19.449.262-24.338 8.729l-42.057 72.845c-4.888 8.467-2.939 19.227 4.609 25.441l21.3 17.534c24.295 20.001 24.295 57.204 0 77.205l-21.3 17.534c-7.548 6.214-9.497 16.974-4.609 25.441l42.057 72.845c4.889 8.467 15.182 12.159 24.338 8.729l25.834-9.678c29.469-11.04 61.688 7.561 66.861 38.602l4.536 27.213c1.607 9.643 9.951 16.711 19.727 16.711h84.116c9.776 0 18.12-7.068 19.727-16.711l4.535-27.213c5.174-31.041 37.393-49.642 66.862-38.602l25.835 9.678c9.155 3.43 19.448-.262 24.337-8.729l42.057-72.845c4.888-8.467 2.939-19.227-4.609-25.441z"
                  transform="translate(256 334.666)"
                  stroke="currentColor"
                  stroke-width="40"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                />
              </g>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>
      <p v-if="!isRecipePage && session?.user" class="text-xs text-emerald-700 dark:text-emerald-300">Signed in as {{ session.user.email }}</p>
      <p v-else-if="!isRecipePage && guestName" class="text-xs text-emerald-700 dark:text-emerald-300">Using app as {{ guestName }}</p>
      <p v-if="!isRecipePage && authMessage" class="text-xs text-emerald-700 dark:text-emerald-300">{{ authMessage }}</p>
      <p v-if="!isRecipePage && actionError" class="text-xs text-rose-700 dark:text-rose-300">{{ actionError }}</p>
      <template v-if="!isRecipePage">
        <RecipeHero :is-detail-view="false" />
        <AppTabs :active-tab="activeTab" @change-tab="setTab" />
      </template>

      <section
        v-if="recipeLoadError"
        class="rounded-2xl border border-rose-500/40 bg-rose-50 px-5 py-4 text-rose-900 shadow-sm dark:bg-zinc-900 dark:text-rose-100"
      >
        <p class="text-sm font-semibold">Failed to load recipes.</p>
        <p class="mt-1 break-words text-sm opacity-90">{{ recipeLoadError }}</p>
        <button
          class="mt-3 inline-flex items-center justify-center cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-rose-400"
          type="button"
          @click="refreshRecipes"
        >
          Retry
        </button>
      </section>

      <template v-if="isRecipePage">
        <RecipeDetailCard
          v-if="selectedRecipe"
          :recipe="selectedRecipe"
          :can-manage="canManageRecipes"
          @back="goToOverview"
          @edit="openEditRecipeModal"
          @delete="removeSelectedRecipe"
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
            class="mt-4 inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            type="button"
            @click="goToOverview"
          >
            {{ t("details.goToOverview") }}
          </button>
        </section>
      </template>
      <template v-else-if="activeTab === 'overview'">
        <OverviewToolbar
          :filtered-count="filteredRecipes.length"
          :total-count="recipes.length"
          @edit-filters="openFilterModal"
        />
        <RecipeList
          :recipes="filteredRecipes"
          @select-recipe="openRecipe"
          @add-recipe="openAddRecipeModal"
        />
        <p v-if="isLoadingRecipes" class="text-sm text-amber-900/75 dark:text-amber-100/75">Loading recipes…</p>
      </template>

      <template v-else-if="activeTab === 'recent'">
        <template v-if="recentRecipes.length > 0">
          <RecipeList
            :recipes="recentRecipes"
            @select-recipe="openRecipe"
            @add-recipe="openAddRecipeModal"
          />
        </template>
        <section
          v-else
          class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-6 text-center shadow-sm dark:bg-zinc-900"
        >
          <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">{{ t("recent.emptyTitle") }}</h2>
          <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
            {{ t("recent.emptyText") }}
          </p>
        </section>
      </template>
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
      v-if="isSettingsOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
      @click.self="isSettingsOpen = false"
    >
      <section class="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-50">Settings</h2>
          <button
            class="inline-flex items-center justify-center cursor-pointer rounded-md px-2 py-1 text-sm text-amber-700 hover:bg-amber-200 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-zinc-800 dark:hover:text-amber-100"
            type="button"
            @click="isSettingsOpen = false"
          >
            Close
          </button>
        </div>

        <div class="mt-4 grid gap-2">
          <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
            <span>{{ t("language") }}</span>
            <select
              :value="locale"
              class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300"
              @change="setLanguage($event.target.value)"
            >
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
              <option value="zh">中文</option>
            </select>
          </label>
        </div>

        <div class="mt-4 grid gap-2">
          <p class="text-sm text-amber-900/85 dark:text-amber-100/85">Theme</p>
          <button
            class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
            type="button"
            @click="toggleTheme"
          >
            Switch to {{ theme === "dark" ? "Light" : "Dark" }} theme
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="isAuthScreenOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
      @click.self="isAuthScreenOpen = false"
    >
      <section class="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
        <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-50">Profile</h2>
        <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
          Sign in with email or continue with just your name. Name mode is optional.
        </p>

        <div class="mt-4 grid gap-2">
          <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
            <span>Email sign-in</span>
            <input
              v-model="authEmail"
              class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
              placeholder="family@email.com"
              type="email"
            />
          </label>
          <button
            class="inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            type="button"
            @click="startEmailSignIn"
          >
            Send magic link
          </button>
          <button
            v-if="session?.user"
            class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
            type="button"
            @click="handleSignOut"
          >
            Sign out
          </button>
        </div>

        <div class="mt-4 grid gap-2">
          <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
            <span>Use with your name (optional)</span>
            <input
              v-model="pendingGuestName"
              class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
              placeholder="Jenny"
              type="text"
            />
          </label>
          <button
            class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
            type="button"
            @click="saveGuestName"
          >
            Save name
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      @click.self="closeAddRecipeModal"
    >
      <div class="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <AddRecipeForm @save-recipe="addRecipe" @cancel="closeAddRecipeModal" />
      </div>
    </div>

    <div
      v-if="isEditModalOpen && editingRecipe"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      @click.self="closeEditRecipeModal"
    >
      <div class="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <AddRecipeForm
          :initial-recipe="editingRecipe"
          submit-label="Save Recipe"
          @save-recipe="saveEditedRecipe"
          @cancel="closeEditRecipeModal"
        />
      </div>
    </div>
  </main>
</template>
