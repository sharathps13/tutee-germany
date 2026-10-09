# Deploying the Germany site to Netlify (via GitHub)

The repo is already configured for Netlify — `netlify.toml` at the root sets everything:

| Setting | Value (from `netlify.toml`) |
|---|---|
| Build command | *none* (static site) |
| Publish directory | `.` (repo root) |
| Functions directory | `netlify/functions` |
| Node version | 20 |

Routes: `/` (landing page), `/universities` (University Explorer), `/api/enquiry` (form handler).
Security headers (CSP etc.) are set in `netlify.toml` and were tested against both pages with no violations.

## One-time setup

1. Push this folder to GitHub (`git add . && git commit -m "..." && git push`).
2. In Netlify: **Add new site → Import an existing project → GitHub** → pick this repository.
3. Netlify reads `netlify.toml` automatically — leave *Build command* empty and *Publish directory* as `.` → **Deploy**.
4. **Site configuration → Environment variables** — add these so the enquiry form can send and store leads:

| Variable | What it is |
|---|---|
| `RESEND_API_KEY` | Resend API key (sends the enquiry email) |
| `MAIL_FROM` | Verified sender address in Resend |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `SITE_COUNTRY` | `Germany` |

   Then **Deploys → Trigger deploy** once so the function picks them up.
5. Optional: **Domain management** → add your custom domain (e.g. `germany.tuteeconnect.com`).

After that, every `git push` to the main branch redeploys the site automatically.

## Check after the first deploy
- Open `/` and `/universities` — both load, header links scroll, University Explorer shows 39 / 39.
- Submit a test enquiry — you should receive the email (and a Supabase row, if configured).
