# Phase 4 Test Plan

## Goals
Verify that the YouthForge project surface delivers reliable creation, discovery, and engagement experiences without regressions or console noise.

## Test Matrix
| Area | Tests | Tool |
| --- | --- | --- |
| Unit / Hooks | `useProjects.flow.test.tsx` (create → feed → detail sync), `cacheConsistency.test.tsx` (likes + comments) | Jest + React Testing Library |
| Components | `ProjectCard`, `RichEditor`, `ChatWidget`, `GlassModal`, `LikeButton` snapshots & interactions | Jest |
| Integration | Firestore adapter smoke tests (mock via adapter factory), QueryClient cache helpers | Jest |
| Manual | Storybook scenarios for ProjectCard, ProjectForm, CommentThread, ImageGallery, LikeButton | Storybook |
| Lint | ESLint + TypeScript typecheck | npm scripts |
| Docs | Markdown lint across `docs/*.md` | `npm run lint:docs` |

## Execution Steps
1. **Install deps**: `npm install`
2. **Static analysis**:
   ```bash
   npm run lint
   npm run typecheck
   ```
3. **Unit & hook suites**:
   ```bash
   npm run test
   ```
4. **Storybook smoke**:
   ```bash
   npm run storybook:build
   ```
5. **Docs lint**:
   ```bash
   npm run lint:docs
   ```
6. **(Optional) Storybook dev**:
   ```bash
   npm run storybook
   ```

## Acceptance Criteria
- Jest passes with zero React act warnings (enforced by prior fixes).
- Storybook build succeeds, showcasing all required variants/states.
- Markdown lint passes for every doc.
- `ci/test-and-storybook.yml` workflow executes lint → tests → storybook → docs lint inside CI to guard regressions.
- No Firebase configuration warnings appear in tests due to guard clauses in `setupTests.ts` and `lib/firebaseClient.ts`.
