(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`250g spaghetti`,`3 tbsp olive oil`,`3 garlic cloves (thinly sliced)`,`1 lemon (zest + juice)`,`40g grated parmesan`,`Salt and black pepper`,`Handful of chopped parsley`],t=[`Boil spaghetti in salted water until al dente.`,`Reserve one cup of pasta water and drain the rest.`,`Warm olive oil in a pan and gently cook garlic for 1 minute.`,`Add lemon zest, lemon juice, and 1/4 cup pasta water to the pan.`,`Toss spaghetti into the sauce, then stir in parmesan and parsley.`,`Season with salt and black pepper. Add extra pasta water if needed.`];document.querySelector(`#app`).innerHTML=`
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
`;var n=document.querySelector(`#ingredients-list`),r=document.querySelector(`#steps-list`);e.forEach(e=>{let t=document.createElement(`li`);t.textContent=e,n.appendChild(t)}),t.forEach(e=>{let t=document.createElement(`li`);t.textContent=e,r.appendChild(t)});