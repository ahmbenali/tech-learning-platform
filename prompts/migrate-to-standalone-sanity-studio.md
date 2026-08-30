# Migrate to a Standalone Sanity Studio

## Goal

Replace the broken embedded Sanity Studio at `/studio` with a standalone Studio workspace, preserving the newly added Sanity configuration and schema scaffolding while keeping the Next.js app separate from the Studio.

## Skills and guidance read

- `sanity-best-practices`: the Next.js integration guide recommends a standalone Studio for new apps, run separately with `sanity dev`, because it preserves independent deploys, Studio auto-updates, and TypeGen watch mode.
- Repository `AGENTS.md`: Vertex requires separate web and Studio workspaces; do not embed the Studio inside Next.js. The web app may use `next-sanity` for server-side content access but must not expose tokens.
- Installed Next.js 16 documentation: proxy/route behavior remains scoped to the web app; the Studio will run independently.

## Existing code inspected

- `app/studio/[[...tool]]/page.tsx` imports `NextStudio` and `metadata` from `next-sanity/studio`.
- `package.json` contains `sanity`, `@sanity/vision`, and `styled-components`, but does not contain `next-sanity`; this directly causes the `Module not found: Can't resolve 'next-sanity/studio'` error.
- The web-side `sanity/lib/client.ts` and `sanity/lib/live.ts` already import from `next-sanity`; the dependency is needed for the web app’s future content access, but not to mount a Studio route.
- `sanity.config.ts`, `sanity.cli.ts`, `sanity/schemaTypes/`, and `sanity/structure.ts` are new uncommitted Studio scaffolding.
- The schema is currently intentionally empty and must remain unchanged.
- `.gitignore` already ignores `.env*`. No environment file contents were read.

## Decisions and assumptions

- Make the Studio a sibling workspace at `studio/`; it will run at `http://localhost:3333`.
- Remove the embedded `app/studio/[[...tool]]` route rather than adding `next-sanity/studio` to make it work.
- Keep `next-sanity` installed in the web workspace because the existing web Sanity client and live-content helper use it.
- Move Studio-only configuration and schema files into `studio/`.
- Use Studio-specific `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and optional `SANITY_STUDIO_API_VERSION` variables. Keep the web app’s `NEXT_PUBLIC_SANITY_*` variables separate.
- Create/update a root `.env.example` with variable names only—never secret values—and a `studio/.env.example` if needed.
- Do not change the empty schema, add content types, import content, or configure the Sanity project/dataset in this migration.

## Files expected to change

- Delete `app/studio/[[...tool]]/page.tsx`.
- Move `sanity.config.ts`, `sanity.cli.ts`, `sanity/schemaTypes/`, and `sanity/structure.ts` to the new `studio/` workspace.
- Add `studio/package.json`, `studio/tsconfig.json`, and any minimal Studio config files needed to run the workspace.
- Add `next-sanity` to the web workspace dependencies and update `bun.lock`.
- Update `sanity/env.ts` or the web helper imports only as required to keep web-side concerns separate.
- Add or update `.env.example` and `studio/.env.example` without values.
- Update `README.md` with separate development commands for web and Studio.

## Requirements

1. Use the existing project id/dataset configuration names only as environment-variable references; do not read, print, or commit their values.
2. The web app must not include a `/studio` route after the migration.
3. The Studio must have its own package manifest and runnable `dev`, `build`, and `deploy` scripts.
4. Keep the Studio’s `basePath` as `/` rather than `/studio` because it is served independently.
5. Keep Clerk and the web proxy isolated from the Studio workspace.
6. Ensure `next-sanity` is available to the web-side client/live helper imports.
7. Do not expose Sanity write/read tokens to browser code. The Studio’s public project/dataset identifiers are configured in its own local env file.
8. Preserve unrelated untracked files, including the home design image and existing home-page prompt.

## Security considerations

- Do not print `.env*` file contents.
- Do not commit project secrets, API tokens, or local environment files.
- Keep the browser free of private Sanity tokens.
- Configure CORS separately through Sanity when the Studio/app needs cross-origin access; do not weaken application auth or proxy rules.

## Acceptance criteria

- The `next-sanity/studio` module-not-found error is eliminated because the embedded route no longer exists.
- `bun run dev` starts the web app without compiling a Studio route.
- `bunx sanity dev` from `studio/` starts the Studio on port 3333 after local Studio env values are present.
- `bunx tsc --noEmit`, lint, and a web production build pass.
- The Studio workspace can build successfully once its required public environment variables are supplied.
- No secret values appear in tracked files or command output.

## Manual test steps

1. Set the web Sanity public variables in the web local env file.
2. Set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` in `studio/.env`.
3. Run `bun run dev` from the repository root and confirm the Vertex home page loads at `http://localhost:3000`.
4. Confirm `http://localhost:3000/studio` is no longer an app route.
5. In another terminal, run `bun run dev` from `studio/`.
6. Open `http://localhost:3333`, log in to Sanity, and confirm the Studio loads with the Content and Vision tools.

