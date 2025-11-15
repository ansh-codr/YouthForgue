import type { ProjectsAdapter } from '@/src/types/project';

const MAX_SLUG_LENGTH = 64;

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);

export async function isSlugAvailable(slug: string, adapter: ProjectsAdapter): Promise<boolean> {
  const existing = await adapter.fetchProjects({ slug, limit: 1 });
  return existing.projects.length === 0;
}

export async function ensureUniqueSlug(
  title: string,
  adapter: ProjectsAdapter,
  maxAttempts = 5,
): Promise<string> {
  let candidate = slugify(title);
  if (!candidate) {
    candidate = `project-${Date.now()}`;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const available = await isSlugAvailable(candidate, adapter);
    if (available) {
      return candidate;
    }
    candidate = slugify(`${candidate}-${Math.floor(Math.random() * 1000)}`);
  }

  throw new Error('Unable to generate a unique slug. Please choose a different title.');
}
