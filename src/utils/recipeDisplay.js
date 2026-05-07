export function inferRecipeEmoji(recipe, fallback = "🍽️") {
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
