# Lingora — Words travel. Meaning connects.

A polished, responsive full-stack language translation app, built with **React, TypeScript, Vite, Tailwind CSS v4, Lucide**, and a secure Azure AI Translator REST API integration. Translation requests run through a server endpoint; **the Azure key never ships to the browser**.

> **Real translations require your own Azure AI Translator credentials.** Without credentials, the interface clearly shows a setup message. No fabricated output or demo translation is substituted.

## What you can do

- Translate plain text between **43 curated languages**, with automatic source-language detection.
- Choose languages through searchable, keyboard-accessible language selectors.
- Swap source and target languages; reverse existing translated text when available. If the source is Auto detect, translate once to discover its language before swapping.
- Read source or translated text aloud via the browser's Speech Synthesis API, when supported. Voice availability and pronunciation depend on the browser/OS.
- Paste original text; copy either original or translated text with confirmation.
- Use **Ctrl + Enter** (Windows/Linux) or **Cmd + Enter** (macOS) to translate.
- Save up to 30 recent translations in **localStorage**, reuse them, remove them individually, or clear them all.
- Switch between custom-designed light and dark modes (preference stored locally).
- See informative empty/loading/failed/configuration-required states; use keyboard-friendly focus controls.
- Use a desktop side-by-side layout or touch-friendly stacked mobile layout.

## Technology / architecture

```text
lingora/
├── .github/workflows/ci.yml       # GitHub Actions type-check, test, and build
├── api/
│   ├── status.ts                  # Vercel serverless configuration status
│   └── translate.ts               # Vercel serverless translation endpoint
├── public/
│   └── favicon.svg
├── server/
│   ├── dev.ts                     # Local Express API
│   └── translator.ts              # Shared validation + Azure API adapter
├── src/
│   ├── components/
│   │   ├── AboutView.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HistoryView.tsx
│   │   ├── LanguageSelect.tsx
│   │   ├── Logo.tsx
│   │   └── TranslationWorkspace.tsx
│   ├── data/languages.ts
│   ├── hooks/useSpeech.ts
│   ├── lib/storage.ts
│   ├── lib/translationClient.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
├── tests/
│   ├── api.test.ts                # Mocked provider integration tests
│   ├── routes.test.ts             # Serverless handler tests
│   └── storage.test.ts            # Persistence and history tests
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

## Requirements

- Node.js **20.19+** (Node.js 22 LTS recommended)
- npm
- An Azure AI Translator resource and its secret key for real translation calls

## Quick start

1. In this directory, install dependencies:

   ```bash
   npm install
   ```

2. Create your local `.env` file:

   ```bash
   cp .env.example .env
   ```

3. Configure your Azure resource settings in `.env` (instructions below).
4. Start the **frontend and API together**:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:5173**. Vite proxies `/api/*` requests to the local Express server on port `3001`.

> Running `vite` alone starts the frontend but not the translation API. Always use `npm run dev` for local development.

## Azure Translator setup

1. In the [Azure Portal](https://portal.azure.com/), create an **Azure AI Translator** resource (or use an eligible existing Translator resource).
2. In its **Keys and Endpoint** section, obtain a key and the region. Check the resource's pricing/quotas in Azure; requests may incur charges.
3. Add settings to `.env`, without quotes:

   ```dotenv
   AZURE_TRANSLATOR_KEY=YOUR_REAL_SECRET_KEY
   AZURE_TRANSLATOR_REGION=eastus
   AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
   PORT=3001
   ```

4. For a global single-service Translator resource, the region may be optional; for a regional or multi-service resource, set the region exactly as shown in Azure.
5. Restart `npm run dev` after changing server environment variables.
6. Test an actual translation using **English → Spanish** and type a real sentence. To test auto detection, leave the source on **Detect language**. Azure reports the detected language in its response.

**How it works:** the React app sends `{ text, sourceLanguage, targetLanguage }` to `POST /api/translate`. The server validates the input and calls the Azure Translator REST endpoint `/translate?api-version=3.0&to=...` using the secret key header. When `sourceLanguage` is `auto`, the server omits `from` to ask Azure to detect it. The provider's actual translation and detection are returned to React. See [Microsoft's Translator REST API reference](https://learn.microsoft.com/en-us/rest/api/translator/translator/translate).

### API routes

**GET `/api/status`**

```json
{ "configured": true }
```

This indicates that a non-placeholder key is present, **not** that the credentials have been verified by Azure. If they are invalid, a real translation request shows a credential error.

**POST `/api/translate`**

```json
{ "text": "Hello world", "sourceLanguage": "auto", "targetLanguage": "es" }
```

Example *response structure* (the actual text always comes from Azure, never a fake frontend translation):

```json
{
  "translatedText": "...actual response from Azure...",
  "detectedLanguage": "en",
  "sourceLanguage": "auto",
  "targetLanguage": "es"
}
```

Possible error envelope:

```json
{ "error": { "code": "RATE_LIMIT", "message": "Translation limit reached. Please try again in a moment." } }
```

The API rejects missing text, invalid languages, same-language requests and content over 5,000 Unicode characters. Upstream requests time out after 15 seconds; credentials are never echoed in errors.

## Testing and quality checks

The included **GitHub Actions CI** workflow runs type checking, automated tests, and a production build on pushes to `main` and pull requests. A successful CI run confirms the code builds in a fresh dependency-installed environment; Azure live calls still require credentials.

```bash
npm run check      # TypeScript type checking
npm run build      # TypeScript check + production bundle
npm test           # Node.js built-in tests (backend, mocked Azure responses)
```

### Manual end-to-end verification checklist

- [ ] Configure a working Azure key; translate English → Spanish and Urdu → English.
- [ ] Try Auto detect and confirm the detected source language.
- [ ] Swap languages after a translation and verify reversed text.
- [ ] Try empty input, identical source/target language, and a 5,001-character paste.
- [ ] Temporarily use an invalid key; verify that authentication failures show an error.
- [ ] Test throttling/provider network failures under your own provider test setup.
- [ ] Copy translated text; check paste and both read-aloud controls in a supported browser.
- [ ] Save translation, refresh the browser, reuse it, remove it, and clear history.
- [ ] Switch themes and refresh; check navigation and language search with keyboard.
- [ ] Check 360px / 768px / 1440px viewport widths, including long RTL paragraphs.
- [ ] Run DevTools console and browser accessibility checks.

## Deploy to Vercel

The repository is set up so Vercel serves the Vite frontend and handles `api/*.ts` as serverless functions. The local Express server is **not** deployed to Vercel.

1. Create a Vercel project for the repository **only after you're ready to deploy**.
2. Select Framework Preset **Vite** with **Root Directory:** repository root (`./`), **Install Command:** `npm install`, **Build Command:** `npm run build`, and **Output Directory:** `dist`. These build settings are also in `vercel.json`. Keep the `api/` folder at the repository root so Vercel detects the serverless endpoints.
3. Set these **server-side** Vercel Environment Variables for the environments you intend to use:

   - `AZURE_TRANSLATOR_KEY` — your real key.
   - `AZURE_TRANSLATOR_REGION` — your resource region if required.
   - `AZURE_TRANSLATOR_ENDPOINT` — optional HTTPS Azure endpoint.

4. Deploy. Check `/api/status`, then perform an **actual** translation on the deployed site.
5. If you change secret environment variables, **redeploy** so functions receive them.

Never prefix the secret with `VITE_`, store it in `src/`, or commit `.env`. `.env` is ignored by Git. For production safety, restrict resource keys and set sensible Azure quotas; consider authentication and per-user rate limiting before exposing this to significant public traffic. This starter includes upstream timeout/error mapping but no durable abuse-prevention layer.

## Privacy and accessibility notes

- Local translation history and theme preferences remain in the browser's `localStorage`; nothing is synchronized to an account. Anyone using the same browser profile can see this local history.
- Text submitted for translation **does leave the browser** and is processed by the configured Azure Translator service. Do not describe the translation text as stored solely on the device.
- Translation history has a maximum of 30 entries and can be cleared.
- SpeechSynthesis voice support varies by browser and installed language voices. Some languages may be unavailable for speech even though translation is supported.
- Key controls have labels, focus styles, searchable language choices, announcements for errors, and reduced-motion support.

## Notes for assessors

Lingora implements a real provider boundary; missing credentials intentionally disable live translation instead of generating fabricated text. API behavior can be tested without a paid key using **mocked provider responses** in `npm test`. Actual translation should be verified with the configured Azure resource.

## Repository publication

A dedicated repository is recommended so Lingora can be imported directly by Vercel without affecting unrelated projects. If you need to create a repository yourself, create an **empty** repository named `lingora` under the intended GitHub account. **Do not** initialize it with a GitHub-generated README, license, or `.gitignore`, because those files already exist in this project.

From the project root, once the repository exists and your own Git credentials are configured:

```bash
git init -b main
git add .
git commit -m "feat: build Lingora translation application"
git remote add origin https://github.com/OWNER/lingora.git
git push -u origin main
```

Replace `OWNER` with the correct GitHub username. Do not upload `.env`, API keys, or `node_modules`. The included `.gitignore` excludes these files. If the repo is already populated, inspect it and merge carefully instead of force-pushing.

**Status:** The source is ready for repository publication, but dependency installation, a complete production build, and an authenticated Azure live-translation test must be completed in a network-enabled environment before calling a deployed release fully verified.
