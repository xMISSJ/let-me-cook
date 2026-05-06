<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddRecipeForm from "./components/AddRecipeForm.vue";
import AppHeaderBar from "./components/AppHeaderBar.vue";
import FilterModal from "./components/FilterModal.vue";
import OverviewToolbar from "./components/OverviewToolbar.vue";
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
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=MintChefNori&backgroundColor=d9f99d,bbf7d0,dcfce7&hairColor=16a34a,22c55e,15803d",
    alt: "Cute chef avatar 7",
  },
  {
    id: "cute-chef-8",
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=KitchenKiki&backgroundColor=ddd6fe,bbf7d0,fecaca",
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
    src: "https://api.dicebear.com/9.x/thumbs/svg?seed=RoseChefRin&backgroundColor=bfdbfe,c7d2fe,bbf7d0",
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
const selectedCuisine = ref("All");
const selectedMealType = ref("All");
const recentRecipeIds = ref([]);
const favoriteRecipeIds = ref([]);

const selectedRecipe = computed(() =>
  recipes.value.find((recipe) => String(recipe.id) === String(route.params.id)),
);
const isRecipePage = computed(() => Boolean(route.params.id));
const currentMenu = computed(() => {
  if (route.name === "favorites") return "favorites";
  if (route.name === "planner") return "planner";
  if (route.name === "profile") return "profile";
  return "overview";
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
      selectedCuisine.value === "All" || recipe.cuisine === selectedCuisine.value;
    const mealTypeMatch =
      selectedMealType.value === "All" || recipe.mealType === selectedMealType.value;
    return cuisineMatch && mealTypeMatch;
  }),
);
const recentRecipes = computed(() => {
  const recentIdSet = new Set(recentRecipeIds.value.map((id) => String(id)));
  return recipes.value.filter((recipe) => recentIdSet.has(String(recipe.id))).slice(0, 3);
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
const activeEditorName = computed(() => guestName.value.trim() || "Guest");
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

function clearFilters() {
  selectedCuisine.value = "All";
  selectedMealType.value = "All";
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
    actionError.value = "Only the recipe owner or app admin can edit this recipe.";
    return;
  }
  editingRecipeId.value = selectedRecipe.value.id;
  isEditModalOpen.value = true;
}

function openEditRecipeModalById(recipeId) {
  const targetRecipe = recipes.value.find((recipe) => String(recipe.id) === String(recipeId));
  if (!targetRecipe || !canManageRecipe(targetRecipe)) {
    actionError.value = "Only the recipe owner or app admin can edit this recipe.";
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
    actionError.value = "Only the recipe owner or app admin can delete this recipe.";
    return;
  }
  const shouldDelete = window.confirm("Delete this recipe?");
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
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <div>
    <main
      class="font-description-preview min-h-screen bg-amber-100 text-amber-950 dark:bg-zinc-950 dark:text-amber-100"
      :class="isRecipePage ? 'px-0 py-0 pb-24 md:pb-0' : 'px-4 py-8 pb-24 md:px-6 md:pb-8 xl:px-10'"
    >
    <div
      class="mx-auto w-full"
      :class="isRecipePage ? 'max-w-none' : 'grid max-w-7xl gap-4'"
    >
      <p v-if="!isRecipePage && guestName" class="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
        <img
          :src="selectedProfileAvatar.src"
          :alt="selectedProfileAvatar.alt"
          class="h-4 w-4 rounded-full object-cover"
          loading="lazy"
        />
        <span>Using app as {{ guestName }}</span>
      </p>
      <p v-if="!isRecipePage && actionError" class="text-xs text-rose-700 dark:text-rose-300">{{ actionError }}</p>
      <div v-if="!isRecipePage" :class="isRecipePage ? '' : '-mx-4 md:-mx-6 xl:-mx-10'">
        <AppHeaderBar :active-menu="currentMenu" @navigate="navigateToMenu" />
      </div>

      <section
        v-if="recipeLoadError"
        class="rounded-2xl border border-rose-500/40 bg-rose-50 px-5 py-4 text-rose-900 shadow-sm dark:bg-zinc-900 dark:text-rose-100"
      >
        <p class="text-sm font-semibold">Failed to load recipes.</p>
        <p class="mt-1 break-words text-sm opacity-90">{{ recipeLoadError }}</p>
        <button
          class="mt-3 inline-flex items-center justify-center cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-zinc-950 lg:hover:bg-rose-400"
          type="button"
          @click="refreshRecipes"
        >
          Retry
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
          <p class="text-sm font-semibold text-amber-900/80 dark:text-amber-100/80">Loading recipe…</p>
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
          <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="grid gap-4">
              <RecipeList
                :recipes="filteredRecipes"
                :favorite-recipe-ids="favoriteRecipeIds"
                @select-recipe="openRecipe"
                @add-recipe="openAddRecipeModal"
                @edit-recipe="openEditRecipeModalById"
                @delete-recipe="removeRecipeById"
                @toggle-favorite="toggleFavoriteRecipe"
              />
              <p v-if="isLoadingRecipes" class="text-sm text-amber-900/75 dark:text-amber-100/75">Loading recipes…</p>
            </div>

            <aside class="hidden h-fit rounded-2xl border border-amber-500/30 bg-amber-50 p-4 shadow-sm md:grid md:gap-4 dark:bg-zinc-900">
              <section class="grid gap-2">
                <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-900/75 dark:text-amber-100/75">Overview panel</h3>
              </section>

              <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
                {{ t("overview.showing", { filtered: filteredRecipes.length, total: recipes.length }) }}
              </p>

              <section class="grid gap-2 rounded-xl border border-amber-500/30 bg-white p-3 dark:bg-zinc-800">
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-50">Active filters</h3>
                <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
                  Cuisine:
                  <span class="font-semibold">{{ selectedCuisine === "All" ? t("filters.all") : t(`cuisine.${selectedCuisine}`, selectedCuisine) }}</span>
                </p>
                <p class="text-xs text-amber-900/80 dark:text-amber-100/80">
                  Meal type:
                  <span class="font-semibold">{{ selectedMealType === "All" ? t("filters.all") : t(`mealType.${selectedMealType}`, selectedMealType) }}</span>
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
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-50">Recent picks</h3>
                <p v-if="recentRecipes.length === 0" class="text-xs text-amber-900/75 dark:text-amber-100/75">
                  Open a recipe to pin it here.
                </p>
                <button
                  v-for="recipe in recentRecipes"
                  :key="recipe.id"
                  class="group grid cursor-pointer gap-2 rounded-lg border border-amber-500/30 bg-white/70 px-3 py-2.5 text-left transition-[box-shadow,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 lg:hover:border-amber-400/70 lg:hover:bg-amber-200 lg:hover:shadow-sm lg:hover:shadow-amber-900/10 dark:bg-zinc-800/70 dark:focus-visible:ring-amber-300/60 dark:focus-visible:ring-offset-zinc-800 dark:lg:hover:border-amber-300/50 dark:lg:hover:bg-zinc-700 dark:lg:hover:shadow-black/25"
                  type="button"
                  @click="openRecipe(recipe.id)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-amber-900 dark:text-amber-50">
                        {{ recipe.title }}
                      </p>
                      <div class="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-medium text-amber-900/80 dark:text-amber-100/80">
                        <span class="rounded-full bg-amber-100 px-2 py-0.5 dark:bg-zinc-700">
                          {{ t(`cuisine.${recipe.cuisine}`, recipe.cuisine) }}
                        </span>
                        <span class="rounded-full bg-amber-100 px-2 py-0.5 dark:bg-zinc-700">
                          {{ t(`mealType.${recipe.mealType}`, recipe.mealType) }}
                        </span>
                      </div>
                    </div>
                    <span class="shrink-0 text-base opacity-80">{{ recipe.thumbnail || "🍽️" }}</span>
                  </div>

                  <div class="flex items-center justify-between gap-3 text-[11px] text-amber-900/80 dark:text-amber-100/80">
                    <span class="inline-flex items-center gap-1 font-semibold text-amber-900/75 dark:text-amber-100/75">
                      Open
                      <span class="inline-block transition-transform duration-200 ease-out lg:group-hover:translate-x-0.5" aria-hidden="true">→</span>
                    </span>
                    <div class="flex items-center gap-3">
                    <span>{{ recipe.cookTimeMinutes }} min</span>
                    <span>{{ recipe.servings }} servings</span>
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
                <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">Favorites</h2>
                <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
                  Your saved recipes in one place.
                </p>
              </div>
              <button
                class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-amber-500/50 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-[box-shadow,background-color] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-sm active:brightness-95 dark:bg-zinc-700 dark:text-amber-100 dark:lg:hover:bg-zinc-600"
                type="button"
                @click="navigateToMenu('overview')"
              >
                Browse all
              </button>
            </div>
            <section
              v-if="favoriteRecipes.length === 0"
              class="mt-4 rounded-xl border border-amber-500/30 bg-white px-5 py-6 text-center dark:bg-zinc-800"
            >
              <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-50">No favorites yet</h3>
              <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
                Tap the heart on any recipe to add it here.
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

        <section
          v-else-if="!isRecipePage && currentMenu === 'planner'"
          key="menu-planner"
          class="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-6 text-center shadow-sm dark:bg-zinc-900"
        >
          <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">Planner</h2>
          <p class="mt-2 text-sm text-amber-900/85 dark:text-amber-100/85">
            Planner calendar is temporarily disabled while we prepare plugin integration.
          </p>
        </section>

        <section
          v-else-if="!isRecipePage && currentMenu === 'profile'"
          key="menu-profile"
          class="overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-50 px-4 py-4 shadow-sm sm:px-5 sm:py-5 lg:rounded-2xl lg:px-7 lg:py-6 dark:bg-zinc-900"
        >
          <div class="mb-4 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-200/70 via-amber-100/80 to-amber-50 px-4 py-4 dark:border-amber-300/20 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900 sm:px-5">
            <div class="flex items-start gap-3">
              <img
                :src="selectedProfileAvatar.src"
                :alt="selectedProfileAvatar.alt"
                class="h-11 w-11 shrink-0 rounded-full border border-amber-500/35 bg-white/85 object-cover shadow-sm dark:border-amber-300/25 dark:bg-zinc-800/85"
                loading="lazy"
              />
              <div class="min-w-0">
                <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-50">Profile</h2>
                <p class="mt-1 inline-flex items-center rounded-full border border-amber-500/25 bg-white/75 px-2 py-0.5 text-[11px] font-medium text-amber-900/80 dark:border-amber-300/20 dark:bg-zinc-800/70 dark:text-amber-100/80">
                  Customize your cooking space
                </p>
              </div>
            </div>
            <div class="mt-3">
              <p class="mt-1 text-sm text-amber-900/85 dark:text-amber-100/85">
                Set your display name and app preferences.
              </p>
            </div>
          </div>

          <div class="grid gap-3 lg:gap-4 lg:grid-cols-2">
            <section class="rounded-2xl border border-amber-500/25 bg-white/80 p-4 shadow-[0_6px_18px_-16px_rgba(120,53,15,0.45)] dark:border-amber-300/20 dark:bg-zinc-800/70">
              <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">Identity</h3>
              <p class="mt-1 text-xs text-amber-900/75 dark:text-amber-100/75">This name appears while you browse recipes.</p>
              <div class="mt-4 grid gap-3">
                <div class="grid gap-2">
                  <p class="text-sm text-amber-900/85 dark:text-amber-100/85">Avatar</p>
                  <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    <button
                      v-for="avatar in PROFILE_AVATAR_OPTIONS"
                      :key="avatar.id"
                      class="inline-flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border p-1 transition-[background-color,box-shadow,border-color] duration-200 ease-out"
                      :class="
                        pendingProfileAvatar === avatar.id
                          ? 'border-amber-500 bg-amber-200/70 shadow-sm dark:border-amber-300 dark:bg-zinc-700'
                          : 'border-amber-500/30 bg-white/70 lg:hover:bg-amber-100 dark:border-amber-300/20 dark:bg-zinc-800/70 dark:lg:hover:bg-zinc-700'
                      "
                      type="button"
                      @click="selectProfileAvatar(avatar.id)"
                    >
                      <img
                        :src="avatar.src"
                        :alt="avatar.alt"
                        class="h-full w-full rounded-[10px] bg-white/60 object-contain p-0.5 dark:bg-zinc-800/60"
                        loading="lazy"
                      />
                    </button>
                  </div>
                </div>
                <label class="grid gap-1.5 text-sm text-amber-900/85 dark:text-amber-100/85">
                  <span>Use with your name (optional)</span>
                  <input
                    v-model="pendingGuestName"
                    class="w-full rounded-xl border border-amber-500/40 bg-white px-3 py-3 text-base text-amber-900 outline-none focus:border-amber-500 dark:bg-zinc-800 dark:text-amber-100 dark:focus:border-amber-300 sm:py-2 sm:text-sm"
                    placeholder="Jenny"
                    type="text"
                  />
                </label>
                <button
                  class="inline-flex w-full items-center justify-center cursor-pointer rounded-xl border border-amber-500/50 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition-[background-color,box-shadow] duration-200 ease-out lg:hover:bg-amber-200 lg:hover:shadow-sm dark:bg-zinc-800 dark:text-amber-100 dark:lg:hover:bg-zinc-700 sm:w-auto sm:py-2"
                  type="button"
                  @click="saveGuestName"
                >
                  Save
                </button>
              </div>
            </section>

            <section class="rounded-2xl border border-amber-500/25 bg-white/80 p-4 shadow-[0_6px_18px_-16px_rgba(120,53,15,0.45)] dark:border-amber-300/20 dark:bg-zinc-800/70">
              <h3 class="text-base font-semibold text-amber-900 dark:text-amber-50">Settings</h3>
              <div class="mt-4 grid gap-4">
                <label class="grid gap-1.5 text-sm text-amber-900/85 dark:text-amber-100/85">
                  <span>{{ t("language") }}</span>
                  <USelect
                    :model-value="locale"
                    :items="languageItems"
                    value-key="value"
                    class="w-full [&_button]:rounded-xl [&_button]:border-amber-500/25 [&_button]:bg-amber-50/90 [&_button]:text-amber-900 [&_button]:shadow-none [&_button]:ring-0 [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-amber-500/40 dark:[&_button]:border-amber-300/20 dark:[&_button]:bg-zinc-900/70 dark:[&_button]:text-amber-100 dark:[&_button]:focus-visible:ring-amber-300/35 [&_span]:text-amber-900 dark:[&_span]:text-amber-100"
                    @update:model-value="setLanguage"
                  />
                </label>
                <div class="flex items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-50/90 px-3 py-3 dark:border-amber-300/20 dark:bg-zinc-900/70 sm:py-2">
                  <p class="text-sm font-medium text-amber-900/85 dark:text-amber-100/85">Dark theme</p>
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
            </section>
          </div>
        </section>
      </Transition>
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
</style>
