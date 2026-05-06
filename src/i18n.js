import { createI18n } from "vue-i18n";

const SUPPORTED_LOCALES = ["en", "nl", "zh"];

function getDeviceLocale() {
  if (typeof navigator === "undefined") return "en";

  const raw =
    (Array.isArray(navigator.languages) && navigator.languages[0]) ||
    navigator.language ||
    "en";

  const normalized = String(raw).toLowerCase();
  const base = normalized.split("-")[0];

  if (base === "nl") return "nl";
  if (base === "zh") return "zh";
  if (base === "en") return "en";

  return "en";
}

const messages = {
  en: {
    appName: "Let Me Cook",
    language: "Language",
    tabs: {
      overview: "Overview",
      details: "Recipe Details",
    },
    hero: {
      title: "My Recipe Book",
      detailDescription: "Recipe details with ingredients and steps.",
      overviewDescription: "Browse your recipes, open one for details, or add your own.",
    },
    overview: {
      showing: "Showing {filtered} of {total} recipes",
      editFilters: "Edit Filters",
      myRecipes: "My Recipes",
      helpText: "Click a recipe to open ingredients and step-by-step details.",
      addRecipe: "Add Recipe",
    },
    details: {
      backToRecipes: "Back to recipes",
      ingredients: "Ingredients",
      steps: "Steps",
      noneTitle: "No recipe selected yet",
      noneText: "Open one from the Overview tab to see ingredients and steps.",
      goToOverview: "Go to Overview",
    },
    filters: {
      title: "Filter Recipes",
      close: "Close",
      cuisine: "Cuisine",
      mealType: "Meal Type",
      clear: "Clear Filters",
      apply: "Apply",
      all: "All",
    },
    addRecipeForm: {
      title: "Add Your Own Recipe",
      subtitle: "Enter one ingredient and one step per line.",
      recipeTitle: "Recipe title",
      shortDescription: "Short description",
      cuisine: "Cuisine",
      mealType: "Meal Type",
      difficulty: "Difficulty",
      cookTime: "Cook time (min)",
      servings: "Servings",
      ingredientsPlaceholder: "Ingredients (one per line)",
      stepsPlaceholder: "Steps (one per line)",
      addRecipe: "Add Recipe",
      cancel: "Cancel",
      requiredError: "Please fill in title, description, and at least one ingredient and step.",
      invalidNumbersError: "Please enter a valid cook time and servings.",
    },
    meta: {
      minutes: "min",
    },
    cuisine: {
      Italian: "Italian",
      Chinese: "Chinese",
      Japanese: "Japanese",
      Mexican: "Mexican",
      Indian: "Indian",
      American: "American",
      International: "International",
    },
    mealType: {
      Breakfast: "Breakfast",
      Lunch: "Lunch",
      Dinner: "Dinner",
      Snack: "Snack",
      Dessert: "Dessert",
    },
    difficulty: {
      Easy: "Easy",
      Medium: "Medium",
      Hard: "Hard",
    },
  },
  nl: {
    appName: "Laat Mij Koken",
    language: "Taal",
    tabs: {
      overview: "Overzicht",
      details: "Receptdetails",
    },
    hero: {
      title: "Mijn Receptenboek",
      detailDescription: "Receptdetails met ingredienten en stappen.",
      overviewDescription: "Blader door je recepten, open er een voor details of voeg je eigen toe.",
    },
    overview: {
      showing: "{filtered} van {total} recepten getoond",
      editFilters: "Filters Bewerken",
      myRecipes: "Mijn Recepten",
      helpText: "Klik op een recept om ingredienten en stapsgewijze details te openen.",
      addRecipe: "Recept Toevoegen",
    },
    details: {
      backToRecipes: "Terug naar recepten",
      ingredients: "Ingredienten",
      steps: "Stappen",
      noneTitle: "Nog geen recept geselecteerd",
      noneText: "Open er een vanuit het Overzicht-tabblad om ingredienten en stappen te zien.",
      goToOverview: "Ga naar Overzicht",
    },
    filters: {
      title: "Recepten Filteren",
      close: "Sluiten",
      cuisine: "Keuken",
      mealType: "Maaltijdtype",
      clear: "Filters Wissen",
      apply: "Toepassen",
      all: "Alles",
    },
    addRecipeForm: {
      title: "Voeg Je Eigen Recept Toe",
      subtitle: "Voer per regel een ingredient en een stap in.",
      recipeTitle: "Recepttitel",
      shortDescription: "Korte beschrijving",
      cuisine: "Keuken",
      mealType: "Maaltijdtype",
      difficulty: "Moeilijkheid",
      cookTime: "Kooktijd (min)",
      servings: "Porties",
      ingredientsPlaceholder: "Ingredienten (een per regel)",
      stepsPlaceholder: "Stappen (een per regel)",
      addRecipe: "Recept Toevoegen",
      cancel: "Annuleren",
      requiredError: "Vul titel, beschrijving en minstens een ingredient en stap in.",
      invalidNumbersError: "Voer een geldige kooktijd en aantal porties in.",
    },
    meta: {
      minutes: "min",
    },
    cuisine: {
      Italian: "Italiaans",
      Chinese: "Chinees",
      Japanese: "Japans",
      Mexican: "Mexicaans",
      Indian: "Indiaas",
      American: "Amerikaans",
      International: "Internationaal",
    },
    mealType: {
      Breakfast: "Ontbijt",
      Lunch: "Lunch",
      Dinner: "Diner",
      Snack: "Snack",
      Dessert: "Dessert",
    },
    difficulty: {
      Easy: "Makkelijk",
      Medium: "Gemiddeld",
      Hard: "Moeilijk",
    },
  },
  zh: {
    appName: "让我做饭",
    language: "语言",
    tabs: {
      overview: "总览",
      details: "菜谱详情",
    },
    hero: {
      title: "我的菜谱本",
      detailDescription: "查看食材和步骤等菜谱详情。",
      overviewDescription: "浏览菜谱，打开查看详情，或添加你自己的菜谱。",
    },
    overview: {
      showing: "显示 {total} 个中的 {filtered} 个菜谱",
      editFilters: "编辑筛选",
      myRecipes: "我的菜谱",
      helpText: "点击菜谱可查看食材和分步详情。",
      addRecipe: "添加菜谱",
    },
    details: {
      backToRecipes: "返回菜谱列表",
      ingredients: "食材",
      steps: "步骤",
      noneTitle: "尚未选择菜谱",
      noneText: "请在总览页打开一个菜谱以查看食材和步骤。",
      goToOverview: "前往总览",
    },
    filters: {
      title: "筛选菜谱",
      close: "关闭",
      cuisine: "菜系",
      mealType: "餐别",
      clear: "清除筛选",
      apply: "应用",
      all: "全部",
    },
    addRecipeForm: {
      title: "添加你的菜谱",
      subtitle: "每行输入一个食材和一个步骤。",
      recipeTitle: "菜谱标题",
      shortDescription: "简短描述",
      cuisine: "菜系",
      mealType: "餐别",
      difficulty: "难度",
      cookTime: "烹饪时间（分钟）",
      servings: "份量",
      ingredientsPlaceholder: "食材（每行一个）",
      stepsPlaceholder: "步骤（每行一个）",
      addRecipe: "添加菜谱",
      cancel: "取消",
      requiredError: "请填写标题、描述，并至少填写一个食材和一个步骤。",
      invalidNumbersError: "请输入有效的烹饪时间和份量。",
    },
    meta: {
      minutes: "分钟",
    },
    cuisine: {
      Italian: "意大利菜",
      Chinese: "中餐",
      Japanese: "日餐",
      Mexican: "墨西哥菜",
      Indian: "印度菜",
      American: "美式",
      International: "国际",
    },
    mealType: {
      Breakfast: "早餐",
      Lunch: "午餐",
      Dinner: "晚餐",
      Snack: "小吃",
      Dessert: "甜点",
    },
    difficulty: {
      Easy: "简单",
      Medium: "中等",
      Hard: "困难",
    },
  },
};

const i18n = createI18n({
  legacy: false,
  locale: SUPPORTED_LOCALES.includes(getDeviceLocale()) ? getDeviceLocale() : "en",
  fallbackLocale: "en",
  messages,
});

export default i18n;
