# API contracts

Base URL: `/api/v1`. Responses are JSON and use the common envelope below. Protected routes require `Authorization: Bearer <token>` and verify ownership. The API root, health, auth, investigations, evidence, notes, media, and accusation routes are implemented.

## Response envelope

Success:

```json
{ "success": true, "message": "Operation successful", "data": {} }
```

Error:

```json
{ "success": false, "message": "An error occurred", "code": "ERROR_CODE" }
```

Validation errors may also include a `details` array. Ownership failures return 404 to avoid confirming another user's resources exist.

## API and health

| Method | Path | Auth | Result |
|---|---|---|---|
| GET | `/` | No | API version information |
| GET | `/health` | No | API status and MongoDB connection state |

## Authentication

| Method | Path | Request | Response data |
|---|---|---|---|
| POST | `/auth/register` | `{name,email,password}` | `{user,token}`; password hash is never returned |
| POST | `/auth/login` | `{email,password}` | `{user,token}` |
| GET | `/auth/me` | Bearer token | `{user}` |

Registration requires name (2-80 characters), valid email, and password (10-72 characters). Passwords are hashed with bcrypt-compatible hashing. Registration and login share a limit of 20 attempts per 15 minutes per IP.

## Investigations

| Method | Path | Contract |
|---|---|---|
| POST | `/investigations` | Auth required. Body `{scenario,genre?,difficulty}`. Scenario is 1-2,000 characters. Returns HTTP 202 with `{investigationId,generationId,generationStatus}`. Limited to five generation requests per hour per IP. |
| GET | `/investigations` | Paginated summaries for current user; includes status and score. Supports `page` and `limit` query parameters. |
| GET | `/investigations/:id` | Public case DTO and current user's progress. Omits canonical solution. |
| GET | `/investigations/:id/generation-status` | `{status,generationStatus,message?}` with safe user-facing failure details. |
| GET | `/investigations/:id/suspects` | Suspect profiles with no culprit marker. |
| GET | `/investigations/:id/timeline` | Public timeline only. |
| DELETE | `/investigations/:id` | Deletes the owned investigation, evidence, progress, notes, and generated media. |

## Evidence and progress

| Method | Path | Contract |
|---|---|---|
| GET | `/investigations/:id/evidence` | Evidence list and per-user opened/bookmarked flags. Does not return clue classifications or canonical fields. |
| POST | `/investigations/:id/evidence/:evidenceId/open` | Marks owned evidence as reviewed. |
| PUT | `/investigations/:id/evidence/:evidenceId/bookmark` | Body `{bookmarked:boolean}`; updates the user's bookmark. |
| GET | `/media/:fileName` | Auth required; serves generated media only after verifying ownership of its evidence. |

## Detective notes

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/investigations/:id/notes` | None | Current user's notes for this investigation |
| POST | `/investigations/:id/notes` | `{content,linkedSuspectId?,linkedEvidenceId?}` | Created note |
| PUT | `/investigations/:id/notes/:noteId` | Editable note fields | Updated note |
| DELETE | `/investigations/:id/notes/:noteId` | None | `{deleted:true}` |

Notes are limited to 5,000 characters. Linked suspects and evidence must belong to the same case.

## Accusation and result

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/investigations/:id/accusation` | `{selectedSuspectId,reasoning?}` | Records one accusation and returns the verdict. |
| GET | `/investigations/:id/result` | None | Full solution only after an accusation has been submitted. |

The backend checks the selected suspect against the stored canonical culprit and calculates the score. Gemini does not decide the verdict.

## Contract rules

- Asynchronous investigation creation returns HTTP 202.
- Validation errors return 400; missing/invalid authentication returns 401; missing or unowned resources return 404; duplicate accusation returns 409; missing configuration may return 503.
- Credentials, prompts, raw model output, and canonical solution data are never returned before the result stage.
- AI-generated structures are validated on the server. Invalid or inconsistent cases are never published.
- Image generation is optional. Missing or failed media uses a fictional placeholder and does not block a valid case.
