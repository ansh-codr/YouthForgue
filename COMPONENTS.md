# YouthForge Component Library (Phase 2)

This document lists implemented components, their props, behaviors, and accessibility notes. It will evolve as features are added.

## ProjectCard (`components/ProjectCard/index.tsx`)
**Props**: `project: Project`
**Features**:
- Glassmorphic layout, media preview, author badge.
- Hover elevation & scale animation (Framer Motion).
- Optimistic like updates via Zustand (`likeProject`).
- Share modal with copy-to-clipboard.
- Accessible buttons with `aria-label`s.

## TagPill (`components/TagPill/TagPill.tsx`)
**Props**: `label`, `onRemove?`, `color?`, `interactive?`
- Keyboard focusable, removable.
- Motion layout animations.

## GlassModal (`components/Modal/GlassModal.tsx`)
Wraps Radix Dialog.
**Props**: `trigger`, `children`, `size`, `open?`, `onOpenChange?`
- Focus trap, ESC close handled by Radix.
- Framer Motion scale+fade.

## CommentThread (`components/CommentThread/CommentThread.tsx`)
**Props**: `projectId`
- Renders list from mock store.
- `react-hook-form` + `zod` validation.
- Optimistic add comment.

## Hooks
- `useProjects`, `useProject`
- `useChallenges`
- `useDevelopers`
- `useAuthMock`
- `useChatbot`

## Store (`lib/mockStore.ts`)
Promise-based actions simulate latency using `sleep` util. Optimistic updates for likes and comments.

## Testing
Jest + RTL configured. Initial tests for ProjectCard, TagPill, GlassModal.

## Accessibility Highlights
- All interactive elements have `aria-label` where icon-only.
- Modal uses focus trap & escape support through Radix.
- Reduced motion: global CSS reduces animations if user prefers.

## New Components Added

### RichEditor (`components/Editor/RichEditor.tsx`)
Props: `onSubmit?`, `className?`
- Markdown textarea with preview toggle.
- Tag selection sourced from store.
- Zod validation (title/body/tags).

### ChatWidget (`components/Chatbot/ChatWidget.tsx`)
Floating assistant that echoes user messages.
Props: none (uses global store). Fixed position bottom-right.

### Enhanced ChallengeCard (`components/cards/ChallengeCard.tsx`)
Adds Join Challenge modal using `respondToChallenge` with success state.

### Enhanced DeveloperCard (`components/cards/DeveloperCard.tsx`)
Adds Contact modal using `sendContactMessage`; success confirmation.

## Updated GlassModal
Now supports optional `title` and `description` props for accessibility (exposed via sr-only header). Tests should include these to avoid Radix warnings.

## Pending Components (Next Batches)
- Editor: drag & drop media, toolbar, slash commands.
- Navbar: command palette (⌘K), global search, auth modal integration.
- Admin: flagged content panel, spotlight selector, tag manager forms.
- Performance: list windowing & memoization.

## Testing Additions
- RichEditor: basic interaction & submit.
- ChatWidget: message echo flow.
Planned: Challenge respond flow, Developer contact success, modal a11y assertions.

## Design Tokens Usage
Glass styles derive from `globals.css` class utilities: `.glass-card`, `.glass-button`, etc.

## Performance Notes
- Use Framer Motion layout where needed; heavy lists should wrap in `React.memo` (future).
- Images use Next Image for optimization & lazy loading.

## Future Firebase Mapping
See `HANDOFF.md` for mapping guidelines.
