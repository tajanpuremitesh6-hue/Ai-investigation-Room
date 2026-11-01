# AI MYSTERY ROOM
## Product Requirements & Technical Specification

| Document Attribute | Details |
|---|---|
| Project Name | AI Mystery Room |
| Document Type | Software Product Specification |
| Version | 1.0 |
| Status | Initial Specification |
| Development Methodology | Spec-Driven Development (SDD) |
| Target Platform | Responsive Web Application |
| AI Provider | Google Gemini |
| Primary Users | Mystery enthusiasts and puzzle solvers |

---

# 1. PROJECT OVERVIEW

## 1.1 Project Description

AI Mystery Room is an AI-powered interactive mystery investigation web application that allows users to transform their own stories or scenarios into fictional detective investigations.

The user provides a short scenario or story. The backend AI engine, powered by Google Gemini, analyses the scenario and generates a complete mystery investigation containing a crime or mysterious incident, suspects, motives, timelines, and multiple forms of fictional evidence.

Users enter an interactive investigation environment where they can examine evidence, investigate suspects, identify contradictions, connect clues, and ultimately select the person they believe is responsible.

The application then evaluates the user's accusation against the actual solution stored in the backend and reveals the complete mystery explanation.

The primary objective is to create a unique, interactive and logically solvable mystery experience for every investigation.

## 1.2 Problem Statement

Traditional mystery games generally rely on predefined investigations and fixed storylines. This limits replayability and prevents users from exploring their own mystery scenarios.

AI Mystery Room addresses this limitation by using generative AI to create customized investigations based on user-provided stories.

Each investigation will contain dynamically generated suspects, evidence, conversations, images, documents, timelines and hidden clues.

## 1.3 Project Objectives

1. Allow users to create mysteries from their own scenarios.
2. Generate complete fictional investigations using Google Gemini.
3. Create believable suspects with individual backgrounds and motives.
4. Generate multiple forms of fictional evidence.
5. Provide an interactive detective investigation interface.
6. Allow users to analyse evidence and investigate suspects.
7. Allow users to submit their final culprit selection.
8. Reveal the correct solution with a detailed explanation.
9. Maintain consistency between all generated evidence and the actual mystery solution.
10. Provide a responsive and user-friendly experience.

# 2. TECHNOLOGY STACK

The application will use the following technologies.

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface |
| Build Tool | Vite | Frontend development and bundling |
| Styling | Tailwind CSS | Responsive styling |
| Routing | React Router | Client-side navigation |
| Backend | Node.js | Server-side runtime |
| Backend Framework | Express.js | REST API development |
| Database | MongoDB | Persistent data storage |
| ODM | Mongoose | Database modelling |
| AI Integration | Google Gemini API | Mystery and evidence generation |
| Image Generation | Gemini-supported image generation | Fictional visual evidence |
| Video Generation | Gemini-supported video generation, if available | Optional CCTV video |
| Authentication | JWT | User authentication |
| Password Hashing | bcrypt | Password security |
| Validation | Zod | Request and AI output validation |
| Icons | Lucide React | Interface icons |
| Media Storage | Local storage during development | Generated media files |

All technologies should use their available free or open-source options wherever possible.

Paid services, subscriptions and external APIs must not be introduced without approval.

The application must remain functional even when optional image or video generation is unavailable.

# 3. USER ROLES

## 3.1 Guest User

A guest user can:

- Access the landing page.
- Explore the application's features.
- Submit a mystery scenario.
- Generate and play an investigation if guest access is enabled.
- View the final investigation result.

## 3.2 Registered User

A registered user can:

- Register and log in.
- Create mystery investigations.
- View investigation history.
- Continue unfinished investigations.
- Save investigation progress.
- Create personal detective notes.
- Submit accusations.
- View completed investigation results.
- Delete personal investigations.

## 3.3 Administrator

Administrator functionality is outside the initial MVP scope.

# 4. FUNCTIONAL REQUIREMENTS

## FR-01: Landing Page

The application must provide a landing page introducing AI Mystery Room.

Required components:

- Navigation bar.
- Application logo and name.
- Hero section.
- Main heading: "Every Story Has a Secret. Find It."
- Short product description.
- Start Investigation button.
- How It Works section.
- Features section.
- Sample investigation preview.
- Footer.

The landing page must communicate that users can create and solve AI-generated mysteries.

## FR-02: Scenario Creation

Users must be able to provide a story or scenario from which the AI generates an investigation.

Required inputs:

| Field | Type | Requirement |
|---|---|---|
| Scenario | Textarea | Required |
| Genre | Selection | Optional |
| Difficulty | Selection | Required |

Supported genres:

- Murder Mystery
- Theft
- Disappearance
- Corporate Espionage
- Blackmail
- General Mystery

Difficulty levels:

- Easy
- Medium
- Hard

Scenario character limit: 2,000 characters initially.

The system must validate user input before sending it to the AI generation engine.

The system will determine the number of suspects and evidence according to the selected difficulty.

## FR-03: AI Mystery Generation

The backend must use Google Gemini to generate a complete investigation based on the submitted scenario.

Every investigation must contain:

1. Unique investigation ID.
2. Case title.
3. Case description.
4. Incident summary.
5. Incident location.
6. Incident date and time.
7. Victim or affected individual, where applicable.
8. Suspect profiles.
9. Suspect relationships.
10. Suspect motives.
11. Suspect alibis.
12. Incident timeline.
13. Evidence inventory.
14. Hidden clues.
15. Contradictions.
16. Actual culprit.
17. Motive and method.
18. Complete solution explanation.

The AI must generate a complete mystery blueprint before generating individual evidence items.

The canonical solution must be stored privately on the backend.

The culprit must not be disclosed to the user before the final accusation.

## FR-04: Suspect Management

Every investigation must contain between 3 and 5 suspects.

Each suspect must include:

- Unique suspect ID.
- Full name.
- Age.
- Occupation.
- Character description.
- Relationship with the victim or incident.
- Possible motive.
- Claimed alibi.
- Relevant background information.
- Optional AI-generated portrait.

Every suspect must be presented as a potential person of interest.

The actual culprit must not be highlighted or visually distinguished.

## FR-05: Evidence Generation

The evidence room is the central gameplay feature.

The system must generate evidence in the following categories.

### A. Chat Evidence

The system must generate fictional messaging conversations.

Required information:

- Sender.
- Receiver.
- Message content.
- Date and timestamp.
- Conversation history.
- Suspicious messages.
- Optional deleted-message indicators.

The conversations should resemble a familiar messaging application without falsely presenting them as authentic WhatsApp records.

### B. Image Evidence

The system must generate fictional visual evidence using an available image-generation model.

Examples:

- Crime scene photographs.
- Suspicious objects.
- Locations.
- Personal belongings.
- Photographs containing visual clues.

### C. CCTV Evidence

The system must provide fictional surveillance evidence.

Examples:

- Camera location.
- Camera ID.
- Timestamp.
- Recorded event description.
- Suspect movements.
- Suspicious activities.

For the initial MVP, CCTV evidence can consist of generated still frames, timestamp overlays and descriptions.

Actual video generation is optional.

### D. Document Evidence

The system must generate fictional documents.

Examples:

- Investigation reports.
- Receipts.
- Letters.
- Access logs.
- Financial records.
- Forensic reports.

Every evidence item must include:

- Evidence ID.
- Evidence title.
- Evidence category.
- Evidence description.
- Timestamp, where relevant.
- Associated suspect IDs, where applicable.
- Clue classification.
- Content or media reference.

Evidence must be accessible through the investigation interface.

## FR-06: Investigation Dashboard

Each investigation must have a dedicated dashboard.

The dashboard must include:

- Case overview.
- Incident information.
- Suspect directory.
- Evidence room.
- Investigation timeline.
- Detective notebook.
- Investigation progress.
- Final accusation button.

Users must be able to navigate between these sections without losing their investigation progress.

## FR-07: Evidence Interaction

Users must be able to:

- Open individual evidence items.
- Read generated conversations.
- View and zoom images.
- View documents.
- Play available video clips.
- Review evidence timestamps.
- Bookmark important evidence.
- Revisit previously opened evidence.

Evidence must remain accessible throughout the investigation.

## FR-08: Detective Notebook

Users must have a personal notebook for recording investigation observations.

Required functionality:

- Create notes.
- Edit notes.
- Delete notes.
- Link notes to suspects.
- Link notes to evidence.

Notes must be associated with the relevant investigation and user.

## FR-09: Final Accusation

The application must provide a final accusation interface.

Users must be able to:

- View all suspects.
- Select one suspect.
- Enter optional reasoning.
- Submit their final accusation.

Only one suspect can be selected as the final culprit.

The system must prevent submission without a valid suspect selection.

Once submitted, the accusation must be stored and the investigation marked as completed.

## FR-10: Verdict and Solution Reveal

After submission, the backend must compare the selected suspect ID with the canonical culprit ID.

The result screen must display:

- Correct or incorrect accusation.
- Actual culprit.
- Culprit's motive.
- Method used.
- Complete incident explanation.
- Important evidence.
- Timeline reconstruction.
- Relevant contradictions.
- Explanation of other suspects' involvement.
- Final score.

The verdict must be determined through backend logic, not by asking Gemini to decide whether the selected culprit is correct.

## FR-11: Investigation History

Registered users must have access to their investigation history.

The history page must display:

- Investigation title.
- Genre.
- Difficulty.
- Creation date.
- Current status.
- Final score, if completed.

Users must be able to reopen, continue or delete their investigations.

# 5. AI INVESTIGATION ENGINE

## 5.1 Generation Architecture

The AI generation engine must operate through multiple stages.

### Stage 1: Scenario Analysis

Gemini analyses the submitted scenario and identifies the incident, environment, characters and constraints.

### Stage 2: Mystery Blueprint Generation

Gemini generates:

- Actual culprit.
- Motive.
- Crime method.
- Suspects.
- Relationships.
- Timeline.
- Alibis.
- Canonical solution.

### Stage 3: Logic Validation

The backend validates the blueprint for contradictions and logical inconsistencies.

### Stage 4: Evidence Generation

Gemini generates evidence based on the approved blueprint.

### Stage 5: Evidence Validation

The backend verifies that evidence matches the established mystery facts.

### Stage 6: Media Generation

The system generates required images and optional video assets.

### Stage 7: Investigation Publication

The completed investigation is stored in MongoDB and made available to the user.

## 5.2 Canonical Solution

Every investigation must have one authoritative solution.

The canonical solution must include:

- Culprit ID.
- Motive.
- Method.
- Relevant timeline.
- Key evidence.
- Explanation.
- Supporting clues.

The solution must be immutable after the investigation is published.

The system must never reveal canonical solution data through normal case, suspect, timeline or evidence API responses.

## 5.3 Evidence Consistency Rules

The following rules are mandatory:

1. Every investigation must have exactly one canonical culprit.
2. All evidence must correspond to the same mystery blueprint.
3. Timestamps must be consistent with the canonical timeline.
4. Suspect alibis must be logically verifiable.
5. Conversations must have consistent participants and timestamps.
6. CCTV events must match the established timeline.
7. Evidence must not introduce an alternative culprit.
8. Every mystery must contain sufficient clues to identify the culprit.
9. At least two independent clues must support the correct solution.
10. Red herrings must be explainable.
11. Every generated evidence item must be validated before publication.
12. Failed validation must trigger a controlled retry or generation failure.

## 5.4 Difficulty Configuration

| Setting | Easy | Medium | Hard |
|---|---|---|---|
| Suspects | 3 | 4 | 5 |
| Evidence items | 6 | 8 | 10 |
| Clue complexity | Low | Moderate | High |
| Timeline complexity | Simple | Multiple events | Interconnected events |
| Red herrings | Few | Moderate | More complex |

Difficulty must influence the complexity of reasoning without making the correct solution impossible to discover.

## 5.5 AI Integration Requirements

Google Gemini must be integrated exclusively through backend services.

The system must:

- Use structured JSON outputs where supported.
- Validate responses using Zod.
- Reject invalid responses.
- Retry failed generations a limited number of times.
- Maintain a configurable model selection.
- Use reusable prompt templates.
- Keep generation logic separate from API controllers.
- Log generation failures without exposing sensitive information.

# 6. DATABASE SPECIFICATION

MongoDB must be used as the primary database.

Required collections:

## 6.1 Users

Fields:

- _id
- name
- email
- passwordHash
- createdAt
- updatedAt

## 6.2 Investigations

Fields:

- _id
- userId
- title
- scenario
- genre
- difficulty
- status
- generationStatus
- incident
- suspects
- timeline
- canonicalSolution
- createdAt
- updatedAt

The canonicalSolution field must contain the private answer and must never be included in public investigation responses.

## 6.3 Evidence

Fields:

- _id
- investigationId
- evidenceId
- title
- type
- description
- content
- mediaUrl
- relatedSuspectIds
- timestamp
- clueType
- createdAt

Supported evidence types:

- chat
- image
- cctv
- document

## 6.4 User Progress

Fields:

- _id
- userId
- investigationId
- openedEvidenceIds
- bookmarkedEvidenceIds
- status
- selectedSuspectId
- reasoning
- score
- completedAt

## 6.5 Detective Notes

Fields:

- _id
- userId
- investigationId
- content
- linkedSuspectId
- linkedEvidenceId
- createdAt
- updatedAt

All collections must have appropriate references, indexes and validation.

# 7. API SPECIFICATION

Base URL: `/api/v1`

## Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register user |
| POST | /auth/login | Authenticate user |
| GET | /auth/me | Get current user |

## Investigation APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /investigations | Create investigation |
| GET | /investigations | Get user investigations |
| GET | /investigations/:id | Get investigation details |
| GET | /investigations/:id/generation-status | Get generation progress |
| GET | /investigations/:id/evidence | Get investigation evidence |
| GET | /investigations/:id/suspects | Get suspects |
| GET | /investigations/:id/timeline | Get timeline |
| POST | /investigations/:id/accusation | Submit accusation |
| GET | /investigations/:id/result | Get completed result |
| DELETE | /investigations/:id | Delete investigation |

## Detective Notes APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /investigations/:id/notes | Create note |
| PUT | /investigations/:id/notes/:noteId | Update note |
| DELETE | /investigations/:id/notes/:noteId | Delete note |

All protected APIs must verify authentication and resource ownership.

API responses must use a consistent JSON structure.

Success response:

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

Error response:

{
  "success": false,
  "message": "An error occurred",
  "code": "ERROR_CODE"
}

Investigation creation must return HTTP 202 Accepted and a generation identifier because generation may take longer than a normal API request.

# 8. FRONTEND ROUTING

The application must provide the following routes:

| Route | Page |
|---|---|
| / | Landing page |
| /login | Login |
| /register | Registration |
| /create | Scenario creation |
| /generating/:id | Generation progress |
| /case/:id | Case overview |
| /case/:id/evidence | Evidence room |
| /case/:id/suspects | Suspect directory |
| /case/:id/timeline | Investigation timeline |
| /case/:id/notes | Detective notebook |
| /case/:id/accuse | Final accusation |
| /case/:id/result | Verdict |
| /dashboard | User dashboard |
| /history | Investigation history |

All routes must use reusable layouts and components.

# 9. UI/UX DESIGN SPECIFICATION

## 9.1 Design Direction

The application must use a cinematic detective investigation theme.

Design characteristics:

- Dark user interface.
- Professional detective workspace.
- Evidence-focused cards.
- Clear information hierarchy.
- Cinematic visual atmosphere.
- Smooth and subtle transitions.
- Responsive layouts.
- Readable typography.

## 9.2 Colour Palette

| Element | Colour |
|---|---|
| Main background | #0B0D10 |
| Secondary background | #141820 |
| Card background | #1B2029 |
| Primary text | #F4F4F5 |
| Secondary text | #9CA3AF |
| Primary accent | #C43D3D |
| Evidence highlight | #D6A34A |

## 9.3 Responsive Design

The application must support:

- Desktop screens.
- Laptop screens.
- Tablets.
- Mobile devices.

Evidence cards, suspect profiles, navigation and investigation panels must adapt to smaller screens.

# 10. SECURITY REQUIREMENTS

1. Gemini API keys must remain on the backend.
2. Passwords must be hashed using bcrypt.
3. Protected endpoints must use JWT authentication.
4. All user-owned resources must have ownership verification.
5. Scenario inputs must be validated and sanitized.
6. Rate limiting must protect authentication and AI generation endpoints.
7. File uploads must validate file types and sizes.
8. Canonical solutions must remain private.
9. AI-generated responses must never be trusted without validation.
10. Prompt injection must be mitigated by treating scenario input as untrusted data.
11. Error messages must not expose credentials or internal system details.
12. All generated evidence must be clearly identified as fictional.

# 11. ERROR HANDLING

The application must handle:

- Gemini API failures.
- Invalid AI responses.
- Inconsistent mystery generation.
- Image generation failures.
- Video generation unavailability.
- MongoDB connection failures.
- Authentication errors.
- Invalid suspect selections.
- Missing investigations.
- Unauthorized resource access.
- Network interruptions.

The application must never publish an incomplete or invalid investigation.

Failed optional media generation must not prevent an otherwise valid case from being published. A suitable placeholder may be displayed.

# 12. PROJECT STRUCTURE

ai-mystery-room/

client/
- public/
- src/
  - assets/
  - components/
    - common/
    - layout/
    - evidence/
    - suspects/
    - investigation/
  - pages/
  - hooks/
  - context/
  - services/
  - routes/
  - utils/
  - App.jsx
  - main.jsx

server/
- config/
- controllers/
- middleware/
- models/
- routes/
- services/
  - gemini/
  - investigation/
  - evidence/
  - media/
- validators/
- utils/
- jobs/
- prompts/
- server.js

docs/
- SPEC.md
- ARCHITECTURE.md
- API.md

README.md
.gitignore

# 13. ENVIRONMENT CONFIGURATION

The application must use environment variables for sensitive configuration.

Required backend environment variables:

PORT=
NODE_ENV=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
GEMINI_API_KEY=
GEMINI_TEXT_MODEL=
GEMINI_IMAGE_MODEL=
GEMINI_VIDEO_MODEL=
CLIENT_URL=
MEDIA_STORAGE_PROVIDER=
MEDIA_STORAGE_PATH=

Actual API keys and credentials must never be committed to version control.

# 14. DEVELOPMENT PHASES

Development must follow the sequence below.

Phase 1: Project initialization, folder structure, React setup, Express setup, MongoDB connection and basic UI.

Phase 2: Authentication, user model, JWT middleware and database models.

Phase 3: Gemini integration, scenario analysis, canonical mystery generation and validation.

Phase 4: Evidence generation, chat evidence, image evidence, document evidence, CCTV evidence and media storage.

Phase 5: Investigation dashboard, suspect directory, evidence room, timeline and detective notebook.

Phase 6: Final accusation, verdict generation, solution reveal and scoring.

Phase 7: Testing, security verification, responsive design, error handling and deployment preparation.

Each phase must be completed and tested before moving to the next phase.

# 15. ACCEPTANCE CRITERIA

The MVP will be considered complete when:

- Users can submit custom mystery scenarios.
- Gemini generates complete investigations.
- Every investigation contains 3–5 suspects.
- Every investigation has exactly one canonical culprit.
- The AI generates consistent evidence.
- Users can access and inspect evidence.
- Users can view suspect profiles.
- Users can inspect the investigation timeline.
- Users can maintain detective notes.
- Users can submit a final accusation.
- The backend correctly determines the verdict.
- The complete solution is revealed after submission.
- Investigation progress is stored persistently.
- User investigation history works.
- Private investigation data is protected.
- The application works on desktop and mobile.
- Generation failures are handled safely.

# 16. OUT OF SCOPE

The following features are excluded from the initial MVP:

- Multiplayer investigations.
- Real-time multiplayer communication.
- Public mystery marketplace.
- Subscription and payment systems.
- Global leaderboards.
- Voice-based interrogation.
- Real-time AI video interviews.
- Native Android and iOS applications.
- Advanced administrator dashboard.
- User-uploaded evidence.

These features may be considered in future versions.

# 17. CODEX DEVELOPMENT INSTRUCTIONS

This specification is the single source of truth for the AI Mystery Room project.

Codex must:

1. Read this entire document before implementation.
2. Analyse requirements before writing code.
3. Follow the specified technology stack.
4. Maintain the specified folder structure.
5. Implement features according to their functional requirements.
6. Use modular and reusable code.
7. Keep frontend and backend responsibilities separate.
8. Keep Gemini integration in backend services.
9. Validate all AI-generated data.
10. Protect the canonical solution.
11. Test every development phase.
12. Update technical documentation when necessary.
13. Never replace required functionality with decorative mockups.
14. Never silently remove or modify specified requirements.
15. Document proposed deviations and obtain approval before implementing them.

If a requirement is ambiguous, document the ambiguity and request clarification rather than inventing functionality.

## Initial Codex Task

Before implementing the entire application:

1. Analyse the complete specification.
2. Prepare the implementation plan.
3. Create the project folder structure.
4. Define database schemas.
5. Define API contracts.
6. Prepare ARCHITECTURE.md and API.md.
7. Implement Phase 1 only.
8. Test Phase 1 and report the results.

Do not proceed to Phase 2 until Phase 1 has been successfully tested.

---

# END OF SPECIFICATION

**Document Version:** 1.0  
**Project:** AI Mystery Room  
**Development Method:** Spec-Driven Development  
**Source of Truth:** docs/SPEC.md