# Supabase setup

This Vite app reads homepage project cards from the `public.projects` table.
Project cards are no longer backed by local mock data.

## Required env variables

Use `.env.local` for local development:

```text
VITE_SUPABASE_URL=https://jrdpdebdbmvoazjsxoek.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`VITE_SUPABASE_ANON_KEY` is still supported for compatibility, but new Supabase publishable keys should use `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Create and seed projects

Run `supabase/projects_seed.sql` in the Supabase SQL Editor.

The script:

- creates `public.projects`
- grants read access to `anon` and `authenticated`
- enables RLS
- creates a public read policy
- inserts 4 dummy project rows

If the table does not exist yet, the app shows a setup/error state instead of project cards.
