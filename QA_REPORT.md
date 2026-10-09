# Lingora — QA / Delivery Report

**Build prepared:** 9 October 2026  
**GitHub status:** Dedicated repository not available at packaging time. No deployment initiated.  
**Translation provider:** Microsoft Azure AI Translator REST v3.0  
**Credentials:** Not supplied; no real key is stored in the project.

A GitHub Actions workflow is included to perform an additional clean dependency-install, type-check, test, and production build after the repository is published. CI has not run yet.

## Verified in this environment

- **15/15 automated tests passed**, covering request validation, source auto-detection contract, headers and payload mapping, provider authentication/limit/network errors, unexpected provider responses, local history retention, theme preferences, API endpoint method rejection and malformed request handling.
- **TypeScript/TSX syntax scan passed** for all authored `.ts`/`.tsx` files using TypeScript 5.8.3 parsing/transpilation.
- **43 language entries** in the configured language list.
- Source code, styling, configuration example, API handlers, documentation, and developer instructions are included.
- `.gitignore` protects `.env` and secrets; only `.env.example` is included.

## Not verified here (requires installation/credentials)

- `npm install`, `npm run check` and `npm run build`: package registry network resolution was unavailable in the current environment, preventing dependencies from being downloaded.
- Live calls to Microsoft Azure AI Translator: no Azure credentials were supplied. **No actual text was translated by Azure in this environment.** Automated integration tests use controlled mock provider responses.
- Browser-level interactive testing for theme toggle, menus, layout breakpoints, clipboard, speech and refresh history: requires a dependency-installed running frontend. A manual checklist is in `README.md`.
- Live Vercel deployment: deliberately not performed without user authorization.

## Reviewer setup

1. Run `npm install` from the project directory using a computer with npm registry access.
2. Run `npm run check`, `npm run build`, and `npm test`.
3. Copy `.env.example` to `.env` and supply your Azure Translator key and region.
4. Run `npm run dev` and perform the manual end-to-end checklist in the README.
5. Review the running UI locally before deploying; inspect any existing target repository before pushing.

**Release gate:** Run type checking and a browser smoke test after dependencies are available, then verify the live translation against your configured Azure resource. Do not treat the mocked tests as a substitute for that final verification.
