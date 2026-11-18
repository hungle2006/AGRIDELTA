# GitHub → Vercel: AGRIDELTA Roots Edition

## Current live deployment

- Project: `agridelta`
- Vercel team: `Hope` (`hope-1091`)
- Production domain: `https://agridelta.vercel.app`
- Vercel project ID: `prj_Au62ITxgnOymDEP3VIWaIW7Kh6L9`
- Release: AGRIDELTA Roots Edition, 2026-11-18
- Deployment method: **Vercel API static source upload** (verified `READY`).

The project is not currently connected to GitHub. Do **not** create a second Vercel project unless you really want a different domain. Link the GitHub repository to the existing `agridelta` project.

## Create the new GitHub repository

1. Sign in to `https://github.com/new`.
2. Owner: your account. Name: `AGRIDELTA`. Choose public or private as desired. **Create an empty repository** without README/gitignore/license because this project already includes them.
3. On your computer, extract the ZIP then open a terminal in the extracted project folder:

```bash
# For a ZIP without bundled .git history
git init -b main
git add .
git commit -m "feat: AGRIDELTA Roots Edition"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/AGRIDELTA.git
git push -u origin main
```

If using the provided `.bundle` file instead of the ZIP, recover the local Git commits:

```bash
git clone AGRIDELTA-Roots-Release.bundle AGRIDELTA
cd AGRIDELTA
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/AGRIDELTA.git
git push -u origin main
```

Do not paste GitHub Personal Access Tokens into the application code.

## Connect Vercel (existing project)

1. Open the existing Vercel project `agridelta` in the Hope workspace.
2. Open **Settings → Git → Connect Git Repository**.
3. Choose the newly created `AGRIDELTA` repository and production branch `main`.
4. If build settings are requested: Framework **Vite**, Build **npm run build**, Output directory **dist**. `vercel.json` includes those settings.
5. Push a commit to a feature branch to verify that Vercel creates a preview deployment. After review, merge to `main` to deploy changes automatically.
6. Confirm `agridelta.vercel.app` still maps to the **existing** project.

## Tests before publishing

```bash
node --check main.js
node --check intro.js
node --check root-guide.js
npm install
npm run build
```

Browser checks: open at mobile widths 320/390 and laptop widths 1280/1440. Confirm seed → watering → harvest → root guide → all five chapter buttons → demo app, and keyboard Escape, focus ring, no horizontal overflow. Also check links for `.glb` and `.webp`.

**Security:** This is a public demo without real authentication, account storage, or a production database. Do not accept real passwords or private data. Add secure server-side authentication and user-scoped persistence before treating it as a real multiuser agricultural management service.