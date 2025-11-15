'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjectFeed } from '@/src/hooks/useProjects';
import type { ProjectRecord, ProjectSort } from '@/src/types/project';

const TAGS = ['All', 'AI/ML', 'Design', 'DevTools', 'Mobile', 'Open Source', 'Web3', 'Productivity'];
const SORTS: ProjectSort[] = ['new', 'popular', 'featured'];

export default function ProjectsPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sort, setSort] = useState<ProjectSort>('new');
  const [search, setSearch] = useState('');

  const { projects, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProjectFeed({
    tag: selectedTag === 'All' ? undefined : selectedTag,
    sort,
  });
  const filtered = useMemo(() => {
    if (!search) return projects;
    const query = search.toLowerCase();
    return projects.filter((project: ProjectRecord) =>
      project.title.toLowerCase().includes(query) ||
      project.summary.toLowerCase().includes(query) ||
      project.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [projects, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background">
      <section className="border-b border-white/5 py-12 px-4 sm:px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl space-y-4">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-accent">
            <Sparkles className="h-4 w-4" /> Phase 4 Launch
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Projects</h1>
              <p className="text-muted-foreground">
                Browse youth-built software with live Firebase likes, comments, and curation controls.
              </p>
            </div>
            <Link href="/create/project" className="glass-button px-6 py-3 text-sm font-semibold">
              Publish a project
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="py-10 px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="grid gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur lg:grid-cols-3">
            <label className="relative flex items-center lg:col-span-1">
              <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, stack, or tag"
                className="glass-input w-full pl-11"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2 lg:col-span-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={selectedTag === tag ? 'glass-button px-3 py-1 text-xs' : 'glass-button-ghost px-3 py-1 text-xs'}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 lg:justify-end">
              {SORTS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSort(option)}
                  className={option === sort ? 'glass-button px-4 py-2 text-xs capitalize' : 'glass-button-ghost px-4 py-2 text-xs capitalize'}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filtered.length ? (
            <div className="space-y-10">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((project: ProjectRecord) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="flex justify-center">
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="glass-button px-6 py-3"
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/5 bg-white/5 p-16 text-center">
              <p className="text-lg font-semibold">No projects match these filters yet.</p>
              <p className="text-sm text-muted-foreground">Try a different tag or be the first to publish under this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
