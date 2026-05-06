import { getSupabaseClient } from "./supabaseClient";
import { seedRecipes } from "./seedRecipes";
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
let unsplashDisabledForSession = false;

function getBestSpoonacularImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.includes("images.unsplash.com")) return url;
  // Spoonacular commonly returns low-res "312x231" thumbnails from complexSearch.
  // Prefer larger known variants from Spoonacular/CDN.
  return url
    .replace("-312x231.", "-636x393.")
    .replace("-556x370.", "-636x393.")
    .replace("-636x393.", "-636x393.")
    .replace("-90x90.", "-636x393.")
    .replace("-240x150.", "-636x393.")
    .replace("-480x360.", "-636x393.");
}

function toUnsplashSizedUrl(url, options = {}) {
  if (!url || typeof url !== "string" || !url.includes("images.unsplash.com")) return url || "";
  try {
    const parsed = new URL(url);
    if (options.w) parsed.searchParams.set("w", String(options.w));
    if (options.q) parsed.searchParams.set("q", String(options.q));
    if (options.fit) parsed.searchParams.set("fit", options.fit);
    if (options.fm) parsed.searchParams.set("fm", options.fm);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getRecipeImageThumbnailUrl(url) {
  return toUnsplashSizedUrl(url, { w: 220, q: 60, fit: "crop", fm: "jpg" });
}

export function getRecipeImageDetailUrl(url) {
  return toUnsplashSizedUrl(url, { w: 1800, q: 85, fit: "max", fm: "jpg" });
}

async function fetchRecipeImageFromMealDb(recipe) {
  const rawTitle = (recipe.title || "").trim();
  const firstIngredient = Array.isArray(recipe.ingredients) ? String(recipe.ingredients[0] || "").trim() : "";
  const queries = [rawTitle, rawTitle.split(" ").slice(0, 2).join(" "), firstIngredient].filter(Boolean);
  if (queries.length === 0) return "";

  for (const query of queries) {
    try {
      const params = new URLSearchParams({ s: query });
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?${params.toString()}`);
      if (!response.ok) continue;
      const data = await response.json();
      const imageUrl = data?.meals?.[0]?.strMealThumb ?? "";
      if (imageUrl) return imageUrl;
    } catch {
      // keep trying other queries
    }
  }

  return "";
}

function withUnsplashTracking(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "let-me-cook");
    parsed.searchParams.set("utm_medium", "referral");
    return parsed.toString();
  } catch {
    return url;
  }
}

function getHighQualityUnsplashUrl(photo) {
  if (!photo?.urls) return "";
  const candidate = photo.urls.raw || photo.urls.full || photo.urls.regular || photo.urls.small || "";
  if (!candidate) return "";
  try {
    const parsed = new URL(candidate);
    parsed.searchParams.set("fm", "jpg");
    parsed.searchParams.set("q", "85");
    parsed.searchParams.set("fit", "max");
    parsed.searchParams.set("w", "1800");
    return parsed.toString();
  } catch {
    return candidate;
  }
}

function toReadableError(error) {
  if (!error) return new Error("Unknown Supabase error");
  if (error instanceof Error) return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    const status = "status" in error ? ` (status ${String(error.status)})` : "";
    return new Error(`${error.message}${status}`);
  }
  return new Error(String(error));
}

function normalizeRecipe(record) {
  return {
    id: record.id,
    userId: record.user_id ?? null,
    createdAt: record.created_at ?? null,
    title: record.title,
    description: record.description,
    thumbnail: record.thumbnail ?? "🍽️",
    cuisine: record.cuisine,
    mealType: record.meal_type,
    difficulty: record.difficulty,
    cookTimeMinutes: record.cook_time_minutes,
    servings: record.servings,
    ingredients: Array.isArray(record.ingredients) ? record.ingredients : [],
    steps: Array.isArray(record.steps) ? record.steps : [],
    imageUrl: getBestSpoonacularImageUrl(record.image_url ?? ""),
    editorName: record.editor_name ?? "",
  };
}

export async function seedRecipesIfEmpty() {
  const supabase = getSupabaseClient();
  const { count, error: countError } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });
  if (countError) throw toReadableError(countError);
  if ((count ?? 0) > 0) return;

  const payload = await Promise.all(
    seedRecipes.map(async (recipe) => {
      const imageUrl = recipe.imageUrl || (await fetchRecipeImageFromSpoonacular(recipe));
      return {
        title: recipe.title,
        description: recipe.description,
        thumbnail: recipe.thumbnail,
        cuisine: recipe.cuisine,
        meal_type: recipe.mealType,
        difficulty: recipe.difficulty,
        cook_time_minutes: recipe.cookTimeMinutes,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        image_url: imageUrl || null,
        editor_name: recipe.editorName ?? null,
      };
    }),
  );

  const { error } = await supabase.from("recipes").insert(payload);
  if (error) throw toReadableError(error);
}

export async function listRecipes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("recipes").select("*").order("id", { ascending: false });
  if (error) throw toReadableError(error);
  return (data ?? []).map(normalizeRecipe);
}

export async function createRecipe(recipe) {
  const supabase = getSupabaseClient();
  const insertPayload = {
    user_id: recipe.userId ?? null,
    title: recipe.title,
    description: recipe.description,
    thumbnail: recipe.thumbnail ?? "🍽️",
    cuisine: recipe.cuisine,
    meal_type: recipe.mealType,
    difficulty: recipe.difficulty,
    cook_time_minutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    image_url: recipe.imageUrl ?? null,
    editor_name: recipe.editorName ?? null,
  };
  const { data, error } = await supabase.from("recipes").insert(insertPayload).select("*").single();

  if (error) throw toReadableError(error);
  return normalizeRecipe(data);
}

export async function updateRecipe(recipeId, recipe) {
  const supabase = getSupabaseClient();
  const updatePayload = {
    title: recipe.title,
    description: recipe.description,
    thumbnail: recipe.thumbnail ?? "🍽️",
    cuisine: recipe.cuisine,
    meal_type: recipe.mealType,
    difficulty: recipe.difficulty,
    cook_time_minutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    image_url: recipe.imageUrl ?? null,
    editor_name: recipe.editorName ?? null,
  };
  if ("userId" in recipe) {
    updatePayload.user_id = recipe.userId ?? null;
  }
  const { data, error } = await supabase
    .from("recipes")
    .update(updatePayload)
    .eq("id", recipeId)
    .select("*")
    .single();

  if (error) throw toReadableError(error);
  return normalizeRecipe(data);
}

export async function deleteRecipe(recipeId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);
  if (error) throw toReadableError(error);
}

export async function uploadRecipeImage(file, userId) {
  const supabase = getSupabaseClient();
  const extension = file.name.split(".").pop() || "jpg";
  const owner = userId || "guest";
  const filePath = `${owner}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("recipe-images").upload(filePath, file, {
    upsert: false,
  });
  if (uploadError) throw toReadableError(uploadError);

  const { data } = supabase.storage.from("recipe-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function fetchRecipeImageFromSpoonacular(recipe) {
  if (!UNSPLASH_ACCESS_KEY || unsplashDisabledForSession) {
    const mealDbImage = await fetchRecipeImageFromMealDb(recipe);
    return mealDbImage || "";
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.slice(0, 5).join(" ") : "";
  const queries = [
    [recipe.title, ingredients, recipe.cuisine, recipe.mealType].filter(Boolean).join(" "),
    [recipe.title, recipe.cuisine].filter(Boolean).join(" "),
    recipe.title || "",
  ].filter((value) => value.trim());

  for (const query of queries) {
    const params = new URLSearchParams({
      query,
      per_page: "1",
      orientation: "landscape",
      content_filter: "high",
    });

    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          "Accept-Version": "v1",
        },
      });
      if (!response.ok) {
        if ([401, 403, 429].includes(response.status)) {
          unsplashDisabledForSession = true;
        }
        console.warn("Unsplash image fetch failed", {
          status: response.status,
          query,
        });
        continue;
      }
      const data = await response.json();
      const match = data?.results?.[0];
      const imageUrl = getBestSpoonacularImageUrl(getHighQualityUnsplashUrl(match));
      if (!imageUrl) continue;
      return withUnsplashTracking(imageUrl);
    } catch (error) {
      console.warn("Unsplash image fetch error", { query, error });
    }
  }

  // No Unsplash result (or blocked by quota/rate limits): fallback to MealDB only.
  const mealDbImage = await fetchRecipeImageFromMealDb(recipe);
  return mealDbImage || "";
}

export async function backfillMissingRecipeImages(limit = 20) {
  if (!UNSPLASH_ACCESS_KEY) return 0;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("recipes").select("*").order("id", { ascending: false }).limit(limit);

  if (error) throw toReadableError(error);
  if (!Array.isArray(data) || data.length === 0) return 0;
  if (!("image_url" in data[0])) return 0;

  let updatedCount = 0;
  const rowsMissingImage = data.filter((row) => !row.image_url);
  for (const row of rowsMissingImage) {
    const imageUrl = await fetchRecipeImageFromSpoonacular({
      title: row.title,
      description: row.description,
      cuisine: row.cuisine,
      mealType: row.meal_type,
      ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    });

    if (!imageUrl) continue;

    const { error: updateError } = await supabase
      .from("recipes")
      .update({ image_url: imageUrl })
      .eq("id", row.id);

    if (!updateError) updatedCount += 1;
  }

  return updatedCount;
}

