"use client";

import { Bookmark, ExternalLink, Github, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProjectRecord } from '@/src/types/project';
import { LikeButton } from '@/components/LikeButton';
import { cn } from '@/lib/utils';

interface Props {
  project: ProjectRecord;
  className?: string;
}

export function ProjectCard({ project, className }: Props) {
  const media = project.media?.[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className={cn('glass-card group flex flex-col overflow-hidden', className)}
    >
      {media && (
        <div className="relative h-48 w-full overflow-hidden rounded-3xl">
          <Image
            src={media.downloadUrl}
            alt={media.alt || project.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
          {project.isFeatured && (
            <span className="absolute top-3 right-3 rounded-full bg-amber-400/80 px-3 py-1 text-xs font-semibold text-black">
              Featured
            </span>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <Link href={`/projects/${project.slug}`} className="group/link block">
          <h3 className="text-lg font-semibold group-hover/link:text-accent transition-colors">{project.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{project.summary}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {project.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            {tag}
          </span>
        ))}
        {project.tags.length > 4 && <span className="text-xs text-muted-foreground">+{project.tags.length - 4}</span>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Image
          src={project.owner.avatarUrl || 'https://avatars.githubusercontent.com/u/1?v=4'}
          alt={project.owner.displayName}
          width={36}
          height={36}
          className="rounded-full"
          unoptimized
        />
        <div>
          <p className="text-sm font-medium">{project.owner.displayName}</p>
          <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center gap-4">
          <LikeButton projectId={project.id} initialCount={project.likesCount} initialLiked={project.likedByViewer} />
          <Link href={`/projects/${project.slug}#comments`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-white">
            <MessageSquare className="h-4 w-4" /> {project.commentsCount}
          </Link>
          {project.visibility === 'unlisted' && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark className="h-3 w-3" /> Unlisted
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {project.demoUrl && (
            <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="glass-button-ghost px-3 py-1 text-xs inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Live
            </Link>
          )}
          {project.repoUrl && (
            <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="glass-button-ghost px-3 py-1 text-xs inline-flex items-center gap-1">
              <Github className="h-3 w-3" /> Code
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default ProjectCard;
