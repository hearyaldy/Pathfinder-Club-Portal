# GitHub Pages deployment

The site is configured for https://hearyaldy.github.io/Pathfinder-Club-Portal/.
The workflow in `.github/workflows/deploy-pages.yml` builds the application
and deploys `dist` on pushes to `main`, or when run manually from Actions.

## Repository settings

1. Open https://github.com/hearyaldy/Pathfinder-Club-Portal/settings/pages.
   Select **GitHub Actions** under **Build and deployment → Source**.
2. Open https://github.com/hearyaldy/Pathfinder-Club-Portal/settings/secrets/actions.
   Add each of the following as a **repository secret**, copying its value
   from your local `.env.local` without surrounding quotes:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Commit and push the application source, `package.json`, `package-lock.json`,
   `vite.config.ts`, and the deployment workflow to `main`. Include the new
   Firebase source files required by the current application. Review the staged
   changes before committing. Do not commit `.env.local`, other `.env` files,
   `serviceAccountKey.json`, `node_modules`, or `dist`.
4. Open the repository **Actions** tab and check **Deploy to GitHub Pages**.
   If source is already pushed when secrets are added, select **Run workflow**.
5. Open the site URL and verify sign-in, registration, and member data access.

## Firebase and private configuration

The `.gitignore` excludes local `.env` files and the service account key.
The workflow receives only the six Firebase web configuration values above.
Vite includes `VITE_*` variables in the public JavaScript bundle; GitHub
Secrets keep their source values out of Git but do not make browser values
private. Never supply service account credentials or private API keys to Vite.

GitHub Pages hosts static files. Firebase Authentication and Firestore remain
hosted by Firebase. This workflow does not deploy Firestore rules or execute
administrative seed scripts.

Before using real member data, review the current Firestore rules: they permit
public member reads, public attendance writes, and self-edits of user roles.
Deploy reviewed rules separately through Firebase. If using Firebase OAuth or
email action links, configure `hearyaldy.github.io` as an authorized domain in
Firebase Authentication settings; retain the Firebase project's auth domain
in `VITE_FIREBASE_AUTH_DOMAIN`.

## Local verification

Member scoring is available in **Live Attendance → Score** for authorized leaders.
Regular events use a 70-point total; Investiture events use 80 points.
Attendance points follow current check-ins. Unit rankings average evaluation
percentages across the church, using each member's unit when scores were saved.
Scoring requires the `/evaluations` rules in `firestore.rules`; score queries
are scoped to the selected church. GitHub Pages does not deploy those rules.

```sh
npm run test:scoring
npm run build
npm run lint
npm run preview
```

Open the preview URL with `/Pathfinder-Club-Portal/` appended.

Reference: https://vite.dev/guide/static-deploy.html#github-pages
