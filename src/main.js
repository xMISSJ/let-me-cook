import "./style.css";

const ingredients = [
  "250g spaghetti",
  "3 tbsp olive oil",
  "3 garlic cloves (thinly sliced)",
  "1 lemon (zest + juice)",
  "40g grated parmesan",
  "Salt and black pepper",
  "Handful of chopped parsley",
];

const steps = [
  "Boil spaghetti in salted water until al dente.",
  "Reserve one cup of pasta water and drain the rest.",
  "Warm olive oil in a pan and gently cook garlic for 1 minute.",
  "Add lemon zest, lemon juice, and 1/4 cup pasta water to the pan.",
  "Toss spaghetti into the sauce, then stir in parmesan and parsley.",
  "Season with salt and black pepper. Add extra pasta water if needed.",
];

document.querySelector("#app").innerHTML = `
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Let Me Cook</p>
      <h1>Weeknight Lemon Garlic Pasta</h1>
      <p class="subtitle">Fresh, simple, and ready in about 20 minutes.</p>
    </header>

    <section class="card">
      <h2>Ingredients</h2>
      <ul id="ingredients-list"></ul>
    </section>

    <section class="card">
      <h2>Steps</h2>
      <ol id="steps-list"></ol>
    </section>
  </main>
`;

const ingredientsList = document.querySelector("#ingredients-list");
const stepsList = document.querySelector("#steps-list");

ingredients.forEach((item) => {
  const li = document.createElement("li");
  li.textContent = item;
  ingredientsList.appendChild(li);
});

steps.forEach((item) => {
  const li = document.createElement("li");
  li.textContent = item;
  stepsList.appendChild(li);
});
