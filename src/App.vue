<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
  backfillMissingRecipeImages,
  createRecipe,
  deleteRecipe,
  fetchRecipeImageFromSpoonacular,
  listRecipes,
  seedRecipesIfEmpty,
  updateRecipe,
  uploadRecipeImage,
} from "./data/recipesDb";
import { listAdminEmails, setUserRole } from "./data/userRolesDb";
import {
  getCurrentSession,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithEmail,
  signOutUser,
} from "./data/supabaseClient";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const appOwnerEmail = String(import.meta.env.VITE_APP_OWNER_EMAIL ?? "")
  .trim()
  .toLowerCase();
const recipes = ref([]);
const isLoadingRecipes = ref(true);
const recipeLoadError = ref("");
const actionError = ref("");
const authEmail = ref("");
const authMessage = ref("");
const session = ref(null);
const adminEmails = ref([]);
const theme = ref("dark");
const guestName = ref("");
const pendingGuestName = ref("");

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingRecipeId = ref(null);
const isFilterModalOpen = ref(false);
const selectedCuisine = ref("All");
const selectedMealType = ref("All");
const recentRecipeIds = ref([]);
const adminEmailInput = ref("");

const selectedRecipe = computed(() =>
  recipes.value.find((recipe) => String(recipe.id) === String(route.params.id)),
);
const isRecipePage = computed(() => Boolean(route.params.id));
const currentMenu = computed(() => {
  if (route.name === "planner") return "planner";
  if (route.name === "profile") return "profile";
  return "overview";
});
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
const signedInEmail = computed(() => String(session.value?.user?.email ?? "").trim().toLowerCase());
const signedInUserId = computed(() => session.value?.user?.id ?? null);
const activeEditorName = computed(() => signedInEmail.value || guestName.value.trim());
const isAdminOwner = computed(() => Boolean(signedInEmail.value) && signedInEmail.value === appOwnerEmail);
const isAdmin = computed(
  () => isAdminOwner.value || (Boolean(signedInEmail.value) && adminEmails.value.includes(signedInEmail.value)),
);
const canAssignAdminRoles = computed(() => Boolean(signedInEmail.value) && isAdmin.value);
const editingRecipe = computed(() =>
  recipes.value.find((recipe) => recipe.id === editingRecipeId.value) ?? null,
);
const canManageSelectedRecipe = computed(() => canManageRecipe(selectedRecipe.value));

function canManageRecipe(recipe) {
  if (!recipe) return false;
  if (isAdmin.value) return true;
  if (signedInUserId.value && recipe.userId && String(recipe.userId) === String(signedInUserId.value)) return true;
  const ownerIdentity = String(recipe.editorName ?? "")
    .trim()
    .toLowerCase();
  if (!ownerIdentity) return false;
  return Boolean(activeEditorName.value) && ownerIdentity === String(activeEditorName.value).trim().toLowerCase();
}

async function refreshAdminRoles() {
  try {
    adminEmails.value = await listAdminEmails();
  } catch (error) {
    console.warn("Unable to load admin roles", error);
    actionError.value = error instanceof Error ? error.message : String(error);
  }
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
  updateBrowserThemeColor();

  if (isSupabaseConfigured()) {
    void getCurrentSession()
      .then((value) => {
        session.value = value;
      })
      .catch((error) => {
        console.warn("Unable to initialize auth session", error);
      });
    try {
      onAuthStateChange((value) => {
        session.value = value;
      });
    } catch (error) {
      console.warn("Unable to subscribe to auth state changes", error);
    }
  } else {
    authMessage.value = "Some features are currently unavailable.";
  }

  void refreshRecipes();
  void refreshAdminRoles();
});

watch(signedInEmail, () => {
  void refreshAdminRoles();
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
  router.push(`/recipe/${recipeId}`);
}

function goToOverview() {
  router.push("/");
}

function navigateToMenu(menu) {
  if (menu === "planner") {
    router.push("/planner");
    return;
  }
  if (menu === "profile") {
    router.push("/profile");
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

function clearFilters() {
  selectedCuisine.value = "All";
  selectedMealType.value = "All";
}

async function addRecipe(recipe) {
  actionError.value = "";
  let imageUrl = "";
  if (recipe.imageFile) {
    imageUrl = await uploadRecipeImage(recipe.imageFile, session.value?.user?.id);
  } else {
    imageUrl = await fetchRecipeImageFromSpoonacular(recipe);
  }
  const created = await createRecipe({
    thumbnail: "🍽️",
    ...recipe,
    userId: signedInUserId.value,
    imageUrl,
    editorName: activeEditorName.value,
  });
  recipes.value.unshift(created);
  router.push("/");
  closeAddRecipeModal();
}

function openEditRecipeModal() {
  if (!selectedRecipe.value || !canManageSelectedRecipe.value) {
    actionError.value = "Only the recipe owner or app admin can edit this recipe.";
    return;
  }
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
  } else if (!imageUrl) {
    imageUrl = await fetchRecipeImageFromSpoonacular(recipe);
  }
  const updated = await updateRecipe(editingRecipe.value.id, {
    ...recipe,
    imageUrl,
  });
  recipes.value = recipes.value.map((item) => (item.id === updated.id ? updated : item));
  closeEditRecipeModal();
}

async function removeSelectedRecipe() {
  if (!selectedRecipe.value || !canManageSelectedRecipe.value) {
    actionError.value = "Only the recipe owner or app admin can delete this recipe.";
    return;
  }
  const shouldDelete = window.confirm("Delete this recipe?");
  if (!shouldDelete) return;
  await deleteRecipe(selectedRecipe.value.id);
  recipes.value = recipes.value.filter((recipe) => recipe.id !== selectedRecipe.value.id);
  recentRecipeIds.value = recentRecipeIds.value.filter((id) => id !== selectedRecipe.value.id);
  localStorage.setItem("let-me-cook-recent-recipe-ids", JSON.stringify(recentRecipeIds.value));
  router.push("/");
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

async function assignAdminRole() {
  if (!canAssignAdminRoles.value) {
    actionError.value = "Only admins can assign roles.";
    return;
  }
  const email = adminEmailInput.value.trim().toLowerCase();
  if (!email) return;
  actionError.value = "";
  await setUserRole({
    email,
    role: "admin",
    assignedBy: signedInEmail.value,
  });
  adminEmailInput.value = "";
  await refreshAdminRoles();
  authMessage.value = `${email} is now an admin.`;
}

async function removeAdminRole(email) {
  if (!canAssignAdminRoles.value) {
    actionError.value = "Only admins can assign roles.";
    return;
  }
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized || normalized === appOwnerEmail) return;
  if (normalized === signedInEmail.value) {
    actionError.value = "You cannot remove your own admin role.";
    return;
  }
  actionError.value = "";
  await setUserRole({
    email: normalized,
    role: "member",
    assignedBy: signedInEmail.value,
  });
  await refreshAdminRoles();
  authMessage.value = `${normalized} is no longer an admin.`;
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
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <UApp>
    <main
      class="min-h-screen bg-amber-100 text-amber-950 dark:bg-zinc-950 dark:text-amber-100"
      :class="isRecipePage ? 'px-0 py-0' : 'px-4 py-8 pb-24 md:pb-8'"
    >
    <div class="mx-auto grid w-full gap-4" :class="isRecipePage ? 'max-w-none' : 'max-w-3xl'">
      <p v-if="!isRecipePage && session?.user" class="text-xs text-emerald-700 dark:text-emerald-300">Signed in as {{ session.user.email }}</p>
      <p v-else-if="!isRecipePage && guestName" class="text-xs text-emerald-700 dark:text-emerald-300">Using app as {{ guestName }}</p>
      <p v-if="!isRecipePage && authMessage" class="text-xs text-emerald-700 dark:text-emerald-300">{{ authMessage }}</p>
      <p v-if="!isRecipePage && actionError" class="text-xs text-rose-700 dark:text-rose-300">{{ actionError }}</p>
      <template v-if="!isRecipePage">
        <RecipeHero :is-detail-view="false" />
      </template>
      <AppTabs :active-menu="currentMenu" @navigate="navigateToMenu" />

      <section
        v-if="recipeLoadError"
        class="rounded-2xl border border-rose-500/40 bg-rose-50 px-5 py-4 text-rose-900 shadow-sm dark:bg-zinc-900 dark:text-rose-100"
      >
        <p class="text-sm font-semibold">Failed to load recipes.</p>
        <p class="mt-1 break-words text-sm opacity-90">{{ recipeLoadError }}</p>
        <UButton
          class="mt-3 inline-flex items-center justify-center cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-rose-400"
          type="button"
          variant="ghost"
          @click="refreshRecipes"
        >
          Retry
        </UButton>
      </section>

      <template v-if="isRecipePage">
        <section
          v-if="isLoadingRecipes"
          class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-6 text-center shadow-sm dark:bg-zinc-900"
        >
          <p class="text-sm text-amber-900/75 dark:text-amber-100/75">Loading recipe…</p>
        </section>
        <RecipeDetailCard
          v-else-if="selectedRecipe"
          :recipe="selectedRecipe"
          :can-manage="canManageSelectedRecipe"
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
          <UButton
            class="mt-4 inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            type="button"
            variant="ghost"
            @click="goToOverview"
          >
            {{ t("details.goToOverview") }}
          </UButton>
        </section>
      </template>
      <template v-else-if="currentMenu === 'overview'">
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

      <template v-else-if="currentMenu === 'planner'">
        <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-6 text-center shadow-sm dark:bg-zinc-900">
          <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">Planner</h2>
          <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
            Planner calendar is temporarily disabled while we prepare plugin integration.
          </p>
        </section>
      </template>
      <template v-else-if="currentMenu === 'profile'">
        <section class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 shadow-sm dark:bg-zinc-900">
          <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-50">Profile</h2>
          <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
            Sign in with email or continue with just your name. Name mode is optional.
          </p>

          <div class="mt-4 grid gap-2">
            <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
              <span>Email sign-in</span>
              <UInput
                v-model="authEmail"
                class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
                placeholder="family@email.com"
                type="email"
              />
            </label>
            <UButton
              class="inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
              type="button"
              variant="ghost"
              @click="startEmailSignIn"
            >
              Send magic link
            </UButton>
            <UButton
              v-if="session?.user"
              class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
              type="button"
              variant="ghost"
              @click="handleSignOut"
            >
              Sign out
            </UButton>
          </div>

          <div class="mt-4 grid gap-2">
            <label class="grid gap-1 text-sm text-amber-900/85 dark:text-amber-100/85">
              <span>Use with your name (optional)</span>
              <UInput
                v-model="pendingGuestName"
                class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
                placeholder="Jenny"
                type="text"
              />
            </label>
            <UButton
              class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-amber-500/50 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
              type="button"
              variant="ghost"
              @click="saveGuestName"
            >
              Save name
            </UButton>
          </div>

          <div class="mt-6 border-t border-amber-500/30 pt-4 dark:border-amber-300/20">
            <div class="mb-6 grid gap-3">
              <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">Admin Roles</h3>
              <p class="text-sm text-amber-900/85 dark:text-amber-100/85">
                Admins can manage recipe ownership permissions and promote other admins.
              </p>
              <p class="text-xs text-amber-900/75 dark:text-amber-100/75">
                Current admins: {{ [appOwnerEmail, ...adminEmails].filter(Boolean).join(", ") || "none" }}
              </p>
              <div v-if="canAssignAdminRoles" class="grid gap-2 sm:grid-cols-[1fr_auto]">
                <UInput
                  v-model="adminEmailInput"
                  class="rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-amber-900 outline-none placeholder:text-amber-700/55 focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:placeholder:text-amber-200/55 dark:focus:border-amber-300"
                  placeholder="new-admin@email.com"
                  type="email"
                />
                <UButton
                  class="inline-flex items-center justify-center cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                  type="button"
                  variant="ghost"
                  @click="assignAdminRole"
                >
                  Make admin
                </UButton>
              </div>
              <div v-if="canAssignAdminRoles && adminEmails.length" class="grid gap-2">
                <div
                  v-for="email in adminEmails"
                  :key="email"
                  class="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-white px-3 py-2 dark:bg-zinc-800"
                >
                  <span class="text-sm text-amber-900 dark:text-amber-100">{{ email }}</span>
                  <UButton
                    v-if="email !== appOwnerEmail && email !== signedInEmail"
                    class="inline-flex items-center justify-center cursor-pointer rounded-lg border border-rose-500/40 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:bg-zinc-800 dark:text-rose-300 dark:hover:bg-zinc-700"
                    type="button"
                    variant="ghost"
                    @click="removeAdminRole(email)"
                  >
                    Remove
                  </UButton>
                </div>
              </div>
            </div>
            <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">Settings</h3>
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
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm text-amber-900/85 dark:text-amber-100/85">Dark theme</p>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input
                    class="peer sr-only"
                    type="checkbox"
                    :checked="theme === 'dark'"
                    aria-label="Toggle dark theme"
                    @change="toggleTheme"
                  />
                  <span
                    class="h-6 w-11 rounded-full bg-amber-300/80 transition peer-checked:bg-amber-500 dark:bg-zinc-700 dark:peer-checked:bg-amber-400"
                  />
                  <span
                    class="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5 dark:bg-zinc-950"
                  />
                </label>
              </div>
            </div>
          </div>
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
      v-if="isAddModalOpen"
      class="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/70 p-0 sm:items-center sm:p-4"
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
  </UApp>
</template>
