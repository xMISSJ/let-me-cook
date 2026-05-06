import { getSupabaseClient } from "./supabaseClient";
import { seedRecipes } from "./seedRecipes";
const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
let spoonacularDisabledForSession = false;

function getBestSpoonacularImageUrl(url) {
  if (!url || typeof url !== "string") return "";
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

function getUnsplashFallbackUrl(recipe) {
  const parts = [recipe.title, recipe.cuisine, recipe.mealType, "food"].filter(Boolean).join(",");
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(parts)}`;
}

function isMissingImageColumnError(error) {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);
  return (
    message.includes("column recipes.image_url does not exist") ||
    message.includes("Could not find the 'image_url' column of 'recipes'")
  );
}

function isMissingEditorNameColumnError(error) {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);
  return message.includes("Could not find the 'editor_name' column of 'recipes'");
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
  if (error) {
    const shouldDropImage = isMissingImageColumnError(error);
    const shouldDropEditorName = isMissingEditorNameColumnError(error);
    if (!shouldDropImage && !shouldDropEditorName) throw toReadableError(error);

    const fallbackPayload = payload.map((row) => {
      const nextRow = { ...row };
      if (shouldDropImage) delete nextRow.image_url;
      if (shouldDropEditorName) delete nextRow.editor_name;
      return nextRow;
    });
    const { error: retryError } = await supabase.from("recipes").insert(fallbackPayload);
    if (retryError) throw toReadableError(retryError);
  }
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

  let { data, error } = await supabase
    .from("recipes")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error && (isMissingImageColumnError(error) || isMissingEditorNameColumnError(error))) {
    const fallbackPayload = { ...insertPayload };
    if (isMissingImageColumnError(error)) delete fallbackPayload.image_url;
    if (isMissingEditorNameColumnError(error)) delete fallbackPayload.editor_name;
    const retry = await supabase.from("recipes").insert(fallbackPayload).select("*").single();
    data = retry.data;
    error = retry.error;
  }
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

  let { data, error } = await supabase
    .from("recipes")
    .update(updatePayload)
    .eq("id", recipeId)
    .select("*")
    .single();
  if (error && (isMissingImageColumnError(error) || isMissingEditorNameColumnError(error))) {
    const fallbackPayload = { ...updatePayload };
    if (isMissingImageColumnError(error)) delete fallbackPayload.image_url;
    if (isMissingEditorNameColumnError(error)) delete fallbackPayload.editor_name;
    const retry = await supabase
      .from("recipes")
      .update(fallbackPayload)
      .eq("id", recipeId)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }
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
  if (!SPOONACULAR_API_KEY || spoonacularDisabledForSession) {
    const mealDbImage = await fetchRecipeImageFromMealDb(recipe);
    return mealDbImage || getUnsplashFallbackUrl(recipe);
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
      number: "1",
      sort: "popularity",
      sortDirection: "desc",
      apiKey: SPOONACULAR_API_KEY,
    });

    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 402 || response.status === 401) {
          spoonacularDisabledForSession = true;
        }
        console.warn("Spoonacular image fetch failed", {
          status: response.status,
          query,
          response: errorText,
        });
        continue;
      }
      const data = await response.json();
      const match = data?.results?.[0];
      const recipeId = match?.id;
      if (!recipeId) continue;

      // Follow up with recipe information endpoint to retrieve larger canonical image.
      const infoParams = new URLSearchParams({ apiKey: SPOONACULAR_API_KEY });
      const infoResponse = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?${infoParams.toString()}`,
      );
      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        const highResUrl = getBestSpoonacularImageUrl(infoData?.image ?? "");
        if (highResUrl) return highResUrl;
      }

      const imageUrl = getBestSpoonacularImageUrl(match?.image ?? "");
      if (imageUrl) return imageUrl;
    } catch (error) {
      console.warn("Spoonacular image fetch error", { query, error });
    }
  }

  // No Spoonacular result (or blocked by quota/billing): fallback to free public sources.
  const mealDbImage = await fetchRecipeImageFromMealDb(recipe);
  return mealDbImage || getUnsplashFallbackUrl(recipe);
}

export async function backfillMissingRecipeImages(limit = 20) {
  if (!SPOONACULAR_API_KEY) return 0;

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

