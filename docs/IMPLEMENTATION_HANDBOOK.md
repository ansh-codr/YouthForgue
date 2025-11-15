# Implementation Handbook

## Architecture Principles
1. **Adapter-first** – All project reads/writes funnel through `getProjectsAdapter`, letting us flip between Firebase and the mock adapter without code churn.
2. **Cache-coherency** – React Query keeps feed + detail data in sync via helpers (`syncProjectDetailInCache`, `updateProjectDetailEntries`). Every mutation invalidates the list query set and reconciles detail keys.
3. **Client-only hooks** – All project-related hooks (`useProjects`, `useComments`, `useToggleLike`) are marked `'use client'` and assume access to `window`, keeping server components lean.
4. **Composable UI** – Glassmorphic cards, dialogs, and editors use small atoms (buttons, tags, motion wrappers). Stories now document official variants for hand-off.

## Key Decisions
- **Mock Adapter Default**: Guarantees deterministic data for Jest + Storybook, while env var opt-in protects Firebase quotas.
- **Optimistic Interaction**: Likes and comments update UI immediately, then reconcile detail caches when adapters confirm. Additional Jest suite (`cacheConsistency.test.tsx`) guards regression.
- **Slug Enforcement**: Slugs auto-generate from title but respect manual overrides; collisions caught via adapter fetch rather than client heuristics.
- **Media Handling**: Compression runs before upload, leveraging `browser-image-compression`. In Storybook we alias the module to a no-op stub for predictable demos.

## Adapter Flip Guide
| Task | Action |
| --- | --- |
| Enable Firebase | Set `NEXT_PUBLIC_USE_FIREBASE=true` and supply Firebase env vars (API key, auth domain, project id, storage bucket, app id). |
| Mock to Firebase | Call `resetProjectsAdapter()` after updating env to refresh the cached instance. |
| Storybook/Test Override | Use `overrideProjectsAdapter` with decorated adapters (e.g., slow upload simulation) to demonstrate unique states without affecting runtime. |

## Trade-offs
- **Complex Form Logic** vs **DX**: ProjectForm keeps validation client-side with RHF + Zod. Some duplication (slug handling) beats server round-trips for Phase 4.
- **Real-time Comments**: Mock adapter simulates listeners but runs in-memory; production needs Firestore listeners. Hook contract mirrors Firestore so swap is low risk.
- **Storybook Mocks**: Aliasing `useAuth`, `useComments`, `next/navigation`, and `lib/upload` ensures reliability but diverges slightly from prod logic. Documented fixtures act as living specs, and we reset adapters around each story to avoid bleed.

## Testing & Observability Hooks
- `npm run test` – runs Jest suites, including the new cache consistency tests and flow coverage.
- `npm run storybook:build` – ensures all stories compile with the mocked providers.
- `ci/test-and-storybook.yml` – GH workflow executes lint → unit tests → Storybook build → docs lint (markdownlint).

## Future Enhancements
- Slot `StorybookAuthProvider` into Cypress for deterministic auth fixtures.
- Use MSW to demo Firebase error paths inside Storybook.
- Extend adapter interface with batch comment pagination & moderation actions once Phase 5 kicks in.
