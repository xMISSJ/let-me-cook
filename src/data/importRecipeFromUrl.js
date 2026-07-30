const CUISINE_VALUES = [
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

const MEAL_TYPE_VALUES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Fetch a recipe website and map schema.org Recipe data into app recipe fields.
 * @param {string} rawUrl
 * @returns {Promise<{
 *   title: string,
 *   description: string,
 *   cuisine: string,
 *   mealType: string,
 *   difficulty: string,
 *   cookTimeMinutes: number,
 *   servings: number,
 *   ingredients: string[],
 *   steps: string[],
 *   sourceUrl: string,
 * }>}
 */
export async function importRecipeFromUrl(rawUrl) {
  const sourceUrl = normalizeUrl(rawUrl);
  if (!sourceUrl) {
    throw new Error("INVALID_URL");
  }

  const html = await fetchPageHtml(sourceUrl);
  const recipeNode = findRecipeJsonLd(html);
  if (!recipeNode) {
    throw new Error("NO_RECIPE_FOUND");
  }

  const title = cleanText(recipeNode.name);
  const description = cleanText(recipeNode.description) || title;
  const ingredients = extractIngredients(recipeNode.recipeIngredient);
  const steps = extractSteps(recipeNode.recipeInstructions);

  if (!title || ingredients.length === 0 || steps.length === 0) {
    throw new Error("INCOMPLETE_RECIPE");
  }

  return {
    title,
    description: truncateText(description, 280),
    cuisine: mapCuisine(recipeNode.recipeCuisine),
    mealType: mapMealType(recipeNode.recipeCategory, recipeNode.keywords),
    difficulty: "Easy",
    cookTimeMinutes: extractCookTimeMinutes(recipeNode),
    servings: extractServings(recipeNode.recipeYield),
    ingredients,
    steps,
    sourceUrl,
  };
}

function normalizeUrl(rawUrl) {
  const trimmed = String(rawUrl ?? "").trim();
  if (!trimmed) return "";

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

async function fetchPageHtml(url) {
  let lastError = null;

  for (const buildProxyUrl of CORS_PROXIES) {
    try {
      const response = await fetch(buildProxyUrl(url), {
        headers: { Accept: "text/html,application/xhtml+xml" },
      });
      if (!response.ok) {
        lastError = new Error(`HTTP_${response.status}`);
        continue;
      }
      const html = await response.text();
      if (html && html.length > 200) return html;
      lastError = new Error("EMPTY_RESPONSE");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("FETCH_FAILED");
}

function findRecipeJsonLd(html) {
  const scriptRegex =
    /<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const raw = match[1]
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const recipe = findRecipeNode(parsed);
      if (recipe) return recipe;
    } catch {
      // Some sites emit multiple JSON objects; try recovering the first object.
      try {
        const recovered = JSON.parse(raw.replace(/[\u0000-\u001F]+/g, " "));
        const recipe = findRecipeNode(recovered);
        if (recipe) return recipe;
      } catch {
        // keep scanning other script tags
      }
    }
  }

  return null;
}

function findRecipeNode(node) {
  if (!node || typeof node !== "object") return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }

  if (isRecipeType(node["@type"])) return node;

  if (Array.isArray(node["@graph"])) {
    return findRecipeNode(node["@graph"]);
  }

  if (node.mainEntity) {
    const found = findRecipeNode(node.mainEntity);
    if (found) return found;
  }

  return null;
}

function isRecipeType(typeValue) {
  const types = Array.isArray(typeValue) ? typeValue : [typeValue];
  return types.some((type) => String(type).toLowerCase() === "recipe");
}

function extractIngredients(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .map((item) => cleanText(typeof item === "string" ? item : item?.name ?? item?.text ?? ""))
    .filter(Boolean);
}

function extractSteps(value) {
  if (!value) return [];

  if (typeof value === "string") {
    return splitInstructionText(value);
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") return [cleanText(item)];
        if (!item || typeof item !== "object") return [];
        if (item.itemListElement) return extractSteps(item.itemListElement);
        const text = cleanText(item.text ?? item.name ?? "");
        return text ? [text] : [];
      })
      .filter(Boolean);
  }

  if (typeof value === "object") {
    if (value.itemListElement) return extractSteps(value.itemListElement);
    const text = cleanText(value.text ?? value.name ?? "");
    return text ? [text] : [];
  }

  return [];
}

function splitInstructionText(text) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const byNewline = cleaned
    .split(/\n+/)
    .map((line) => cleanText(line.replace(/^\d+[\).\-\s]+/, "")))
    .filter(Boolean);

  if (byNewline.length > 1) return byNewline;

  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((part) => cleanText(part))
    .filter(Boolean);
}

function extractCookTimeMinutes(recipeNode) {
  const candidates = [recipeNode.totalTime, recipeNode.cookTime, recipeNode.prepTime];
  for (const candidate of candidates) {
    const minutes = parseIsoDurationMinutes(candidate);
    if (minutes > 0) return clamp(minutes, 1, 1440);
  }
  return 20;
}

function parseIsoDurationMinutes(value) {
  if (!value || typeof value !== "string") return 0;
  const match = value.trim().match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
  if (!match) {
    const plain = Number.parseInt(value, 10);
    return Number.isFinite(plain) && plain > 0 ? plain : 0;
  }
  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);
  return days * 24 * 60 + hours * 60 + minutes + Math.ceil(seconds / 60);
}

function extractServings(value) {
  if (value == null) return 2;
  const raw = Array.isArray(value) ? value[0] : value;
  const text = String(raw);
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return 2;
  const servings = Math.round(Number(match[1]));
  return Number.isFinite(servings) && servings > 0 ? clamp(servings, 1, 100) : 2;
}

function mapCuisine(value) {
  const raw = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  const normalized = raw.toLowerCase();
  if (!normalized) return "International";

  const match = CUISINE_VALUES.find((cuisine) => normalized.includes(cuisine.toLowerCase()));
  return match ?? "International";
}

function mapMealType(...candidates) {
  const haystack = candidates
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  if (!haystack) return "Dinner";
  if (/\bbreakfast\b|\bbrunch\b/.test(haystack)) return "Breakfast";
  if (/\blunch\b/.test(haystack)) return "Lunch";
  if (/\bdessert\b|\bcake\b|\bcookie\b|\bsweet\b/.test(haystack)) return "Dessert";
  if (/\bsnack\b|\bappetizer\b/.test(haystack)) return "Snack";
  if (/\bdinner\b|\bsupper\b|\bmain\b/.test(haystack)) return "Dinner";
  return MEAL_TYPE_VALUES.includes("Dinner") ? "Dinner" : "Dinner";
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
