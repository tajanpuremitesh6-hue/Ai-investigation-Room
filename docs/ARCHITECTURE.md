# Architecture and implementation plan

## Scope and status

This document maps `docs/SPEC.md` to the current application. Phases 1 through 6 are implemented. Phase 7 verification has been run for the frontend build, API startup/health, API validation/authentication responses, and automated server-side schema and generation checks. Full account creation and Gemini generation still require a configured MongoDB URI and Gemini API key.

## System shape

```text
Browser: React, Vite, Tailwind, React Router
  | Bearer-token JSON requests
  v
Express API: auth, investigation, evidence, notes, accusation, media
  | routes -> controllers -> services -> Zod validation
  v
MongoDB via Mongoose
  | server-only Gemini calls
  v
Google GenAI SDK: analysis, blueprint, evidence, evidence audit
```

The browser never receives Gemini credentials or canonical solution data. Case, suspect, timeline, evidence, and generation-status responses use public DTOs. The canonical solution is excluded from normal MongoDB projections and only loaded after an accusation. Local image files are served through an authenticated route that checks investigation ownership.

## Repository layout

```text
client/src/{components,pages,hooks,context,services,routes,utils,assets}/
server/{config,controllers,middleware,models,routes,services,validators,utils,jobs,prompts,storage}/
docs/{SPEC.md,ARCHITECTURE.md,API.md}
```

The original specification remains at root `spec.md`; `docs/SPEC.md` is its project documentation copy.

## Data model

All records use MongoDB ObjectIds, timestamps, references, indexes, and Mongoose validation.

| Collection | Main fields | Important constraints |
|---|---|---|
| `users` | `name`, normalized `email`, `passwordHash` | Unique email index; password hash excluded by default. |
| `investigations` | `userId`, `generationId`, `title`, `scenario`, `genre`, `difficulty`, `status`, `generationStatus`, `incident`, `suspects[]`, `timeline[]`, `contradictions[]`, `canonicalSolution` | 3-5 suspects; one culprit ID; canonical solution excluded by default and immutable after publication. |
| `evidence` | `investigationId`, `evidenceId`, `title`, `type`, `description`, `content`, `mediaUrl`, `mediaStatus`, `relatedSuspectIds[]`, `timestamp`, `clueType`, `isFictional` | Unique `{investigationId,evidenceId}`; types are chat, image, cctv, and document. |
| `userProgress` | `userId`, `investigationId`, opened/bookmarked evidence IDs, status, accusation, reasoning, score, completion time | Unique `{userId,investigationId}`. |
| `detectiveNotes` | `userId`, `investigationId`, content, linked suspect/evidence IDs | Linked records must belong to the same investigation. |

## Mystery generation flow

1. Validate the scenario, genre, and difficulty. Create a private `generating` record and return HTTP 202 with investigation and generation IDs.
2. Analyze the scenario as untrusted story data.
3. Generate the complete canonical blueprint before evidence: incident, suspects, timeline, contradictions, evidence outline, and solution.
4. Validate difficulty counts (Easy: 3 suspects/6 evidence; Medium: 4/8; Hard: 5/10), IDs, chronology, clue support, contradictions, red-herring explanations, and non-culprit explanations.
5. Generate evidence from the approved blueprint, then check evidence IDs, types, participants, timestamps, references, and required content.
6. Ask Gemini to audit each evidence item against the canonical blueprint. Invalid output gets one controlled retry; failed validation never publishes a case.
7. Generate optional local image/CCTV stills only when explicitly enabled in server environment settings. Media failures leave fictional placeholders. Publish the complete case only after required checks pass.

Case creation uses an in-process worker. If the server restarts while a case is generating, startup marks that job failed with a safe message rather than publishing a partial case.

## Security and privacy

- Passwords use bcrypt-compatible hashing; JWTs are issued and verified only by the server.
- Auth and generation routes are rate-limited. Request data and model output are validated with Zod.
- Protected resources check investigation ownership. Media is served through an authenticated ownership-checking endpoint.
- Scenario text is quoted as untrusted data in prompts. Model output is never trusted without structural and semantic checks.
- Evidence is identified as fictional. The `clueType` classification and canonical solution are omitted from normal evidence responses.
- Image generation is disabled by default. The Gemini image model call runs only when `ENABLE_IMAGE_GENERATION=true` and the model/key are configured.

## Implementation phases

1. **Phase 1 - Setup and basic UI: complete.** React/Vite client, Express API, MongoDB connection bootstrap, landing and scenario pages, architecture/API documentation.
2. **Phase 2 - Authentication and models: complete.** Registration/login/current user, JWT, password hashing, ownership middleware, all five MongoDB models, login/register pages.
3. **Phase 3 - AI blueprint: complete.** Gemini service, reusable prompt templates, scenario analysis, canonical blueprint, difficulty/logic validation, generation status API.
4. **Phase 4 - Evidence: complete.** Chat/image/CCTV/document evidence, consistency audit, local optional image storage, authenticated media access, placeholders.
5. **Phase 5 - Investigation UI: complete.** Dashboard/history, case brief, suspect directory, evidence room, timeline, notes, progress and bookmarks.
6. **Phase 6 - Accusation and verdict: complete.** One-time server-checked accusation, deterministic score, solution reveal and explanation.
7. **Phase 7 - Verification: in progress.** Unit checks, build, API smoke checks; production deployment preparation remains.

## Verification status

- [x] Frontend production build succeeds.
- [x] Five automated Node tests pass for scenario constraints, blueprint logic, evidence consistency, and private-field projections.
- [x] API starts without optional services and its health route reports the database state.
- [x] Auth validation returns a JSON 400 for invalid input; protected endpoints reject missing tokens.
- [ ] Successful registration, persistence, and full case-generation run against MongoDB/Gemini; no MongoDB service or Gemini key is configured in this workspace.
