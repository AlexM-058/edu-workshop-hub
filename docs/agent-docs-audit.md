# Agent Documentation Audit

Source repository reviewed:

```text
/Users/alexandru.tarita/Dev/work/bfocus
```

Goal:

- Identify Markdown files and agent-oriented documentation patterns that can
  improve this project.
- Adapt only the parts that fit a Laravel + React Vite + Docker-first workshop
  management platform.

## Relevant Files Found

### Directly Relevant

| Source file | Why it matters | Action for this project |
| --- | --- | --- |
| `AGENTS.md` | Strong repository-level agent guide with setup, testing, review, security, and commit rules. | Adapted into root `AGENTS.md`. |
| `CLAUDE.md` | Captures project overview, critical invariants, architecture, known gotchas, and environment variables. | Use the pattern, not the BFocus content. |
| `docs/ONBOARDING.md` | Good contributor onboarding format with quickstart, architecture map, decisions, and code organization. | Create `docs/onboarding.md` next. |
| `docs/COMMON_ISSUES.md` | Good user-facing troubleshooting structure written in plain language. | Create `docs/common-issues.md` after first real features. |
| `.claude/rules/testing-backend.md` | Detailed test-tier thinking and test ownership. | Adapt conceptually for Laravel/PHPUnit. |
| `.claude/rules/testing-frontend.md` | Frontend test patterns and UI state expectations. | Adapt conceptually when frontend test runner is added. |
| `.claude/rules/backend-gotchas.md` | Captures technical traps that agents should not rediscover repeatedly. | Create similar section in `AGENTS.md`; expand as project grows. |
| `.claude/rules/frontend-gotchas.md` | Useful UI pitfalls: loading/error/normal branches, accessible error states, duplicate CTAs. | Partially adapted into `AGENTS.md`. |
| `.claude/rules/deployment.md` | Deployment operational notes and gotchas. | Create deployment docs when hosting target is selected. |

### Partially Relevant

| Source file | Useful pattern | Why not copied directly |
| --- | --- | --- |
| `docs/ARCHITECTURE.md` | Long-form architecture and data-flow documentation. | BFocus stack is FastAPI/Next/LLM; this project is Laravel/React. |
| `docs/Quickstart.md` | Step-by-step local demo and API smoke checks. | Existing README now covers setup; add richer quickstart later. |
| `frontend/src/components/README.md` | Component inventory by domain. | Too early; useful after real role layouts exist. |
| `src/backend/services/README.md` | Service-layer documentation pattern. | Useful once backend service/action classes are added. |
| `.claude/rules/frontend-theme-core.md` | Design-token discipline and frontend gotchas. | BFocus theme is specific; keep idea for future design system docs. |
| `docs/ux-philosophy.md` | UX milestone planning format. | Product domain differs; can inspire a workshop UX roadmap. |

### Not Relevant For This Project Right Now

These are specific to BFocus and should not be imported:

- LLM provider docs.
- LangChain/LangGraph docs.
- Cube integration docs.
- DuckDB, CSV/XLSX upload, and analytics docs.
- Railway service-specific deployment notes.
- Chat/dashboard roadmap docs.

## Improvements Applied

Created:

```text
AGENTS.md
```

The new file adds project-specific guidance for:

- Docker-first development.
- Laravel backend conventions.
- React Vite frontend conventions.
- Testing expectations.
- Documentation ownership.
- Risk-based review protocol.
- Product gotchas for waiting lists, certificates, language support, database
  ports, and PHP runtime.

## Recommended Next Documentation

### 1. `docs/onboarding.md`

Purpose:

- Help a new teammate start contributing in under 10 minutes.

Suggested sections:

- What the product does.
- Required tools.
- First setup.
- Run the stack.
- Verify backend and frontend.
- Code map.
- First issue workflow.

### 2. `docs/common-issues.md`

Purpose:

- Keep support and development troubleshooting in one place.

Suggested initial issues:

- Docker daemon not running.
- Port `8000` or `5173` already in use.
- Backend health endpoint not responding.
- Frontend says backend is offline.
- Composer or npm dependencies missing.
- Database migrations failing.

### 3. `docs/architecture.md`

Purpose:

- Explain the first real architecture before feature work accelerates.

Suggested sections:

- System overview.
- Role-based access model.
- Backend layers.
- Frontend layout model.
- Database model.
- Enrollment and waiting-list data flow.
- Document-generation flow.
- Internationalization model.

### 4. Subsystem READMEs

Add later:

```text
backend/README.md
frontend/README.md
docker/README.md
```

These should explain local ownership and commands for each subsystem.

## Recommended Engineering Improvements

1. Add a Laravel service/action layer once workshop enrollment begins.
2. Add backend feature tests around business rules, especially waiting-list
   promotion.
3. Add a frontend test runner before building role dashboards.
4. Add visible loading, error, and normal states to every data-fetching component.
5. Keep role names and statuses translation-ready from the start.
6. Maintain a living gotchas section in `AGENTS.md` after every non-obvious fix.

## Proposed Priority

1. Keep `AGENTS.md` now.
2. Add `docs/onboarding.md` next.
3. Add `docs/architecture.md` before implementing authentication and roles.
4. Add `docs/common-issues.md` after the first real user-facing workflows.
