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
4. Set `VITE_AUTH_REDIRECT_URL` in `.env` to your deployed app URL (for example, `https://yourname.github.io/let-me-cook`).
5. In Supabase Dashboard -> Authentication -> URL Configuration:
   - Set Site URL to your deployed app URL.
   - Add both your deployed app URL and `http://localhost:5173` to Redirect URLs.
6. Set `VITE_APP_OWNER_EMAIL` in `.env` to your admin email address.
7. Create a local `.env` file (or GitHub Actions env vars for deploy) using `.env.example`.
8. Re-run `supabase/schema.sql` after pulling latest changes (adds role assignment + image storage policies).

## Family access and editing

- Anyone can view recipes.
- Signed-in users can add recipes and edit/delete only their own recipes.
- App owner/admins can edit/delete any recipe and assign admin roles from Profile.
- Share the app URL with family members to collaborate.

## Deploy to GitHub Pages

For deployed builds to connect to Supabase, add these repository secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AUTH_REDIRECT_URL`

Then keep your existing Pages workflow/branch setup.
