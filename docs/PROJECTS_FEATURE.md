# Projects Feature Specification

## Objective
Deliver a collaborative project shelf for YouthForge Phase 4 that lets members publish builds, review peers, and manage visibility while staying within free Firebase tier budgets.

## Functional Requirements
- **Creation Flow** – Authenticated users can draft, validate, and publish projects with tags, repo/demo URLs, and media uploads (compressed client-side to ≤1MB). Duplicate slugs are prevented via adapter-backed lookups.
- **Discovery & Feed** – `/projects` page surfaces feeds filtered by featured flag, tag, or sort (new/popular/featured). Cards surface likes, comment counts, and quick actions.
- **Engagement** – Visitors can like/unlike with optimistic cache updates, read threaded comments, and submit new comments with real-time reconciliation.
- **Profile Surfacing** – User profile page lists authored projects, respecting visibility + moderation logs.
- **Admin Levers** – Moderation logs & featured flag propagate to cards and details, enabling spotlighted content without re-publishing.

## UX Flows

### Creation
```
User → opens /create/project
    → completes ProjectForm sections (metadata, tags, media)
    → slug availability check
    → optional media compression + upload
    → createProject mutation → QueryClient cache sync
    → router push to /projects/[slug]
```

### Discovery / Detail
```
Visitor → Projects feed
        → selects ProjectCard (prefetched detail query)
        → detail page hydrates ImageGallery, LikeButton, CommentThread
        → real-time listeners keep stats aligned when likes/comments fire elsewhere
```

### Engagement
```
User clicks Like
  → useToggleLike optimistic update
  → adapter toggles + detail caches reconcile via syncProjectDetailInCache

User posts comment
  → useComments optimistic entry (id: optimistic-…)
  → adapter persists
  → project commentsCount increments; feed + detail caches invalidated
```

## Non-Functional Requirements
- **Performance** – React Query cache TTL 30s for feeds, detail reads shared between slug/id keys, suspense-free transitions via skeletons.
- **Resilience** – Mock adapter is default; Firebase adapter is swappable via `NEXT_PUBLIC_USE_FIREBASE`. Missing env vars never crash tests/storybook.
- **Accessibility** – Semantic buttons, ARIA labels, keyboardable modals (Radix), high contrast tokens.
- **Testing** – Jest suites cover ProjectCard, LikeButton flows, Chatbot, Editor, Modal, Query cache consistency, and the new create-feed-detail integration test.

## Visual System Notes
- Glassmorphism panels + gradients from Tailwind tokens (`glass-card`, `glass-button`).
- Motion via Framer for card hover & dialog transitions.
- Lightbox leverages `AnimatePresence`; grid thumbnails highlight selection with brand accent.

## Dependencies
- Next.js 13 app router
- React Query v5
- Firebase Auth & Storage
- Mock adapter for local/storybook/testing parity.
