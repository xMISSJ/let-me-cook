# Let Me Cook

A recipe website built with Vite and Vue. Recipes are stored in Supabase so the same data can be shared across devices/users.

## Run locally

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` before running the app.

## Supabase setup (required)

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Supabase project settings, copy:
   - Project URL -> `VITE_SUPABASE_URL`
   - Publishable or anon public key -> `VITE_SUPABASE_ANON_KEY`
4. Create a local `.env` file (or GitHub Actions env vars for deploy) using `.env.example`.
5. Re-run `supabase/schema.sql` after pulling latest changes (adds edit/delete auth + image upload storage).

## Family access and editing

- Anyone can view recipes.
- Open the Profile screen and either sign in with email magic link or set a display name to add, edit, delete, and upload recipe images.
- Share the app URL with family members to collaborate.

## Deploy to GitHub Pages

For deployed builds to connect to Supabase, add these repository secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then keep your existing Pages workflow/branch setup.
