# AI Mystery Room

AI Mystery Room turns a story prompt into a fictional detective investigation. The project includes the responsive React client, Express API, authentication, MongoDB models, staged Gemini case generation, evidence review, detective notes, accusations, and verdicts. [`docs/SPEC.md`](./docs/SPEC.md) is the project specification; the original root `spec.md` is preserved.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB for accounts and investigations
- A Gemini API key for mystery generation

## Setup

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI` and a private `JWT_SECRET` of at least 32 characters. Add your `GEMINI_API_KEY` to enable case generation. The key stays on the server.
3. Install all workspace dependencies from the repository root:

   ```sh
   npm install
   ```

4. Start both applications with `npm run dev`.

The client runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run client and server together |
| `npm run dev:client` | Run the Vite development server |
| `npm run dev:server` | Run the API server in watch mode |
| `npm run build` | Build the frontend for production |
| `npm test` | Run backend schema and generation validation checks |
| `npm start` | Start the API server |

Image generation is optional and disabled by default. To enable it, set `GEMINI_IMAGE_MODEL` and `ENABLE_IMAGE_GENERATION=true`; failed image generation falls back to a fictional placeholder. CCTV video generation is not required by the MVP.

The API returns HTTP 202 for case creation and the client polls generation status. The server validates the private blueprint and generated evidence before publishing a case. Canonical solutions are excluded from normal case, suspect, timeline, and evidence responses, and are revealed only after an accusation.

## Deploy to Vercel

The repository is configured as a single Vercel Express app with the React client built into Vercel's `public` directory. Add these environment variables in the Vercel project settings before deploying:

Set the Vercel project **Root Directory** to the repository root (`.`). The deployment config builds the React client into `public` and packages the Express API from the root entry point.

- `MONGODB_URI`
- `JWT_SECRET` (at least 32 characters)
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL` (optional; defaults to `gemini-3.8-flash`)
- `ENABLE_IMAGE_GENERATION=false` (recommended because Vercel function storage is temporary)

Keep credentials in Vercel's environment settings and out of Git. The app queues generation with Vercel's function lifecycle helper and the API function is configured for a maximum duration of 300 seconds. Long-running or interrupted generation still depends on that function completing within the account's duration limit.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`docs/API.md`](./docs/API.md) for the data model, generation flow, and API contracts.
