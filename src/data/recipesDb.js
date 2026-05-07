import { getSupabaseClient } from "./supabaseClient";
import { seedRecipes } from "./seedRecipes";
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const CONFIGURED_RECIPE_IMAGES_BUCKET = String(import.meta.env.VITE_SUPABASE_RECIPE_IMAGES_BUCKET ?? "recipe-images").trim();
let unsplashDisabledForSession = false;
const LOCAL_RECIPES_STORAGE_KEY = "let-me-cook-local-recipes";
let imageUrlColumnSupported = null;
let resolvedRecipeImagesBucket = "";
const missingRecipeImageBuckets = new Set();

function readLocalRecipes() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalRecipes(recipes) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_RECIPES_STORAGE_KEY, JSON.stringify(recipes));
}

function isLocalRecipeId(recipeId) {
  return String(recipeId).startsWith("local-");
}

function buildRecipeFromInput(recipeId, recipe, fallback = {}) {
  return {
    id: recipeId,
    userId: recipe.userId ?? fallback.userId ?? null,
    createdAt: fallback.createdAt ?? null,
    title: recipe.title,
    description: recipe.description,
    thumbnail: recipe.thumbnail ?? fallback.thumbnail ?? "🍽️",
    cuisine: recipe.cuisine,
    mealType: recipe.mealType,
    difficulty: recipe.difficulty,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    imageUrl: recipe.imageUrl ?? fallback.imageUrl ?? "",
    editorName: recipe.editorName ?? fallback.editorName ?? "",
  };
}

function upsertLocalRecipe(recipeId, recipe, fallback = {}) {
  const localRecipes = readLocalRecipes();
  const nextRecipe = buildRecipeFromInput(recipeId, recipe, fallback);
  const targetIndex = localRecipes.findIndex((item) => String(item.id) === String(recipeId));
  if (targetIndex === -1) {
    writeLocalRecipes([nextRecipe, ...localRecipes]);
  } else {
    localRecipes[targetIndex] = nextRecipe;
    writeLocalRecipes(localRecipes);
  }
  return nextRecipe;
}

function shouldUseLocalFallback(error) {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return (
    message.includes("missing supabase config") ||
    message.includes("failed to fetch") ||
    message.includes("network")
  );
}

function isMissingImageUrlColumnError(error) {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return message.includes("image_url") && message.includes("could not find");
}

function removeImageUrlField(payload) {
  const nextPayload = { ...payload };
  delete nextPayload.image_url;
  return nextPayload;
}

function getBestSpoonacularImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("data:image/")) return url;
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
  // Recipe cards render at ~112px; request a 2x source for sharper images on high-DPI screens.
  return toUnsplashSizedUrl(url, { w: 420, q: 82, fit: "crop", fm: "jpg" });
}

export function getRecipeImageDetailUrl(url) {
  return toUnsplashSizedUrl(url, { w: 1800, q: 85, fit: "max", fm: "jpg" });
}

/** True when the hero image was uploaded by the user (not Unsplash/MealDB/etc.). */
export function isUserProvidedRecipeImage(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("data:image/") ||
    url.includes("/storage/v1/object/public/") ||
    url.includes("/storage/v1/object/sign/")
  );
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

  let { error } = await supabase.from("recipes").insert(payload);
  if (error && isMissingImageUrlColumnError(error)) {
    imageUrlColumnSupported = false;
    const fallbackPayload = payload.map(removeImageUrlField);
    ({ error } = await supabase.from("recipes").insert(fallbackPayload));
  }
  if (error) throw toReadableError(error);
}

export async function listRecipes() {
  const localRecipes = readLocalRecipes();
  let remoteRecipes = [];
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("recipes").select("*").order("id", { ascending: false });
    if (error) throw toReadableError(error);
    if (Array.isArray(data) && data.length > 0) {
      imageUrlColumnSupported = "image_url" in data[0];
    }
    remoteRecipes = (data ?? []).map(normalizeRecipe);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
  }

  const mergedById = new Map();
  [...remoteRecipes, ...localRecipes].forEach((recipe) => {
    mergedById.set(String(recipe.id), recipe);
  });
  return [...mergedById.values()].sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

export async function createRecipe(recipe) {
  const insertPayload = {
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
    editor_name: recipe.editorName ?? null,
  };
  if (imageUrlColumnSupported === true) {
    insertPayload.image_url = recipe.imageUrl ?? null;
  }
  try {
    const supabase = getSupabaseClient();
    let activeInsertPayload = insertPayload;
    if (imageUrlColumnSupported === false) {
      activeInsertPayload = removeImageUrlField(insertPayload);
    }
    let { data, error } = await supabase.from("recipes").insert(activeInsertPayload).select("*").single();
    if (error && isMissingImageUrlColumnError(error)) {
      imageUrlColumnSupported = false;
      ({ data, error } = await supabase.from("recipes").insert(removeImageUrlField(insertPayload)).select("*").single());
    }
    if (error) throw toReadableError(error);
    if (imageUrlColumnSupported === null) {
      imageUrlColumnSupported = true;
    }
    return normalizeRecipe(data);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const localRecipe = {
      id: `local-${Date.now()}`,
      userId: recipe.userId ?? null,
      createdAt: new Date().toISOString(),
      title: recipe.title,
      description: recipe.description,
      thumbnail: recipe.thumbnail ?? "🍽️",
      cuisine: recipe.cuisine,
      mealType: recipe.mealType,
      difficulty: recipe.difficulty,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      imageUrl: recipe.imageUrl ?? "",
      editorName: recipe.editorName ?? "",
    };
    const localRecipes = readLocalRecipes();
    writeLocalRecipes([localRecipe, ...localRecipes.filter((item) => String(item.id) !== String(localRecipe.id))]);
    return localRecipe;
  }
}

export async function updateRecipe(recipeId, recipe, fallback = {}) {
  if (isLocalRecipeId(recipeId)) {
    const existing = readLocalRecipes().find((item) => String(item.id) === String(recipeId)) ?? {};
    return upsertLocalRecipe(recipeId, recipe, existing);
  }

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
    editor_name: recipe.editorName ?? null,
  };
  if (imageUrlColumnSupported === true) {
    updatePayload.image_url = recipe.imageUrl ?? null;
  }

  try {
    const supabase = getSupabaseClient();
    let activeUpdatePayload = updatePayload;
    if (imageUrlColumnSupported === false) {
      activeUpdatePayload = removeImageUrlField(updatePayload);
    }

    let { data, error } = await supabase
      .from("recipes")
      .update(activeUpdatePayload)
      .eq("id", recipeId)
      .select("*")
      .maybeSingle();

    if (error && isMissingImageUrlColumnError(error)) {
      imageUrlColumnSupported = false;
      ({ data, error } = await supabase
        .from("recipes")
        .update(removeImageUrlField(updatePayload))
        .eq("id", recipeId)
        .select("*")
        .maybeSingle());
    }

    if (error) throw toReadableError(error);
    if (!data) {
      throw new Error("Could not persist recipe update. Check Supabase RLS UPDATE policy for this row.");
    }
    if (imageUrlColumnSupported === null) {
      imageUrlColumnSupported = true;
    }
    return normalizeRecipe(data);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return upsertLocalRecipe(recipeId, recipe, fallback);
  }
}

export async function deleteRecipe(recipeId) {
  if (isLocalRecipeId(recipeId)) {
    const localRecipes = readLocalRecipes();
    writeLocalRecipes(localRecipes.filter((item) => String(item.id) !== String(recipeId)));
    return;
  }
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);
  if (error) throw toReadableError(error);
}

/** When Storage buckets are not set up, small files may be stored inline (see uploadRecipeImage). */
const MAX_EMBEDDED_RECIPE_IMAGE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

function isStorageBucketMissingError(uploadError, readableMessage) {
  const msg = String(readableMessage ?? "").toLowerCase();
  if (msg.includes("bucket not found")) return true;
  if (!uploadError || typeof uploadError !== "object") return false;
  const status = "statusCode" in uploadError ? uploadError.statusCode : uploadError.status;
  if (status === 404 && msg.includes("bucket")) return true;
  return false;
}

export async function uploadRecipeImage(file, userId) {
  const supabase = getSupabaseClient();
  const extension = file.name.split(".").pop() || "jpg";
  const owner = userId || "guest";
  const filePath = `${owner}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const defaultCandidates = [
    CONFIGURED_RECIPE_IMAGES_BUCKET,
    "recipe-images",
    "recipe_images",
    "images",
  ].filter((value, index, list) => value && list.indexOf(value) === index);
  const candidateBuckets = [resolvedRecipeImagesBucket, ...defaultCandidates]
    .filter((value, index, list) => value && list.indexOf(value) === index)
    .filter((bucket) => !missingRecipeImageBuckets.has(bucket));

  let lastError = null;
  for (const bucket of candidateBuckets) {
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: false,
    });
    if (!uploadError) {
      resolvedRecipeImagesBucket = bucket;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    }

    const normalizedError = toReadableError(uploadError);
    const isMissingBucket = isStorageBucketMissingError(uploadError, normalizedError.message);
    if (!isMissingBucket) {
      throw normalizedError;
    }
    missingRecipeImageBuckets.add(bucket);
    lastError = normalizedError;
  }

  if (lastError) {
    if (file.size > MAX_EMBEDDED_RECIPE_IMAGE_BYTES) {
      throw new Error(
        `Could not upload image because no storage bucket was found and the file is too large to save without Storage (${Math.round(file.size / 1024)} KB; max ${MAX_EMBEDDED_RECIPE_IMAGE_BYTES / 1024 / 1024} MB embedded). Create a public Supabase bucket named "${CONFIGURED_RECIPE_IMAGES_BUCKET}" or set VITE_SUPABASE_RECIPE_IMAGES_BUCKET to your existing bucket.`,
      );
    }
    console.warn(
      `[let-me-cook] No recipe image Storage bucket found; saving image inline in the database. Add bucket "${CONFIGURED_RECIPE_IMAGES_BUCKET}" for normal uploads.`,
    );
    return readFileAsDataUrl(file);
  }
  throw new Error("Could not upload image.");
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
  if (imageUrlColumnSupported === false) return 0;
  if (!UNSPLASH_ACCESS_KEY) return 0;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("recipes").select("*").order("id", { ascending: false }).limit(limit);

  if (error) {
    if (isMissingImageUrlColumnError(error)) {
      imageUrlColumnSupported = false;
      return 0;
    }
    throw toReadableError(error);
  }
  if (!Array.isArray(data) || data.length === 0) return 0;
  if (!("image_url" in data[0])) return 0;
  imageUrlColumnSupported = true;

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

