import { getSupabaseClient } from "./supabaseClient";
import { seedRecipes } from "./seedRecipes";

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
    imageUrl: record.image_url ?? "",
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

  const payload = seedRecipes.map((recipe) => ({
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
    image_url: recipe.imageUrl ?? null,
    editor_name: recipe.editorName ?? null,
  }));

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
  const { data, error } = await supabase
    .from("recipes")
    .insert({
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
    })
    .select("*")
    .single();

  if (error) throw toReadableError(error);
  return normalizeRecipe(data);
}

export async function updateRecipe(recipeId, recipe) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("recipes")
    .update({
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
    })
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

