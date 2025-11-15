"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, Bookmark, ExternalLink, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { GlassModal } from '@/components/Modal/GlassModal';
import { useYouthForgeStore } from '@/lib/mockStore';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  project: Project;
  className?: string;
}

export const ProjectCard: React.FC<Props> = ({ project, className }) => {
  const { likeProject } = useProjects();
  const { user } = useAuth();
  const [optimisticLikes, setOptimisticLikes] = useState(project.likeCount);
  const [shareOpen, setShareOpen] = useState(false);
  // Avoid passing a derived array directly to the zustand selector which caused an infinite re-render loop in tests.
  // Subscribe to the raw comments array, then derive project-specific comments with useMemo for stability.
  const allComments = useYouthForgeStore(s => s.comments);
  const projectComments = useMemo(() => allComments.filter(c => c.projectId === project.id), [allComments, project.id]);

  const handleLike = useCallback(async () => {
    // For Firebase mode, require authentication
    const userId = user?.uid || 'anonymous';
    setOptimisticLikes(l => l + 1); // optimistic
    await likeProject(project.id, userId);
  }, [likeProject, project.id, user]);

  const mediaThumb = project.media[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className={cn('glass-card group relative overflow-hidden', className)}
    >
      {/* Media */}
      {mediaThumb && (
        <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
          <Image 
            src={mediaThumb.url} 
            alt={mediaThumb.alt || project.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {project.isFeatured && (
            <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-accent/80 text-white shadow">Featured</span>
          )}
        </div>
      )}

      <Link href={`/projects/${project.id}`} className="block focus:outline-none focus:ring-2 focus:ring-accent rounded">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">{project.title}</h3>
      </Link>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.excerpt}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 4).map(tag => (
          <span key={tag} className="text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20">{tag}</span>
        ))}
        {project.tags.length > 4 && <span className="text-xs text-muted-foreground">+{project.tags.length - 4}</span>}
      </div>

      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
        <Image 
          src={project.author.avatar} 
          alt={project.author.name} 
          width={32} 
          height={32} 
          className="rounded-full"
          unoptimized
        />
        <span className="text-sm font-medium">{project.author.name}</span>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-3">
          <button aria-label="Like project" onClick={handleLike} className="flex items-center gap-1 hover:text-accent transition-colors">
            <Heart size={16} className="text-accent" /> {optimisticLikes}
          </button>
          <Link href={`/projects/${project.id}#comments`} aria-label="View comments" className="flex items-center gap-1 hover:text-accent transition-colors">
            <MessageSquare size={16} /> {projectComments.length}
          </Link>
          <GlassModal
            trigger={(
              <button aria-label="Share project" onClick={() => setShareOpen(true)} className="flex items-center gap-1 hover:text-accent transition-colors">
                <Share2 size={16} /> Share
              </button>
            )}
            open={shareOpen}
            onOpenChange={setShareOpen}
            size="sm"
          >
            <div className="p-6 space-y-4">
              <h4 className="font-semibold text-lg">Share this project</h4>
              <p className="text-sm text-muted-foreground">Copy link or share on social networks.</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`https://youthforge.example/projects/${project.id}`}
                  className="glass-input flex-1"
                  aria-label="Project share link"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`https://youthforge.example/projects/${project.id}`)}
                  className="glass-button text-xs"
                >Copy</button>
              </div>
              <div className="flex gap-2 text-xs">
                <button className="glass-button-ghost px-3">Twitter</button>
                <button className="glass-button-ghost px-3">LinkedIn</button>
                <button className="glass-button-ghost px-3">GitHub</button>
              </div>
            </div>
          </GlassModal>
        </div>
        <div className="flex gap-2">
          {project.deploymentUrl && (
            <Link 
              href={project.deploymentUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Live demo" 
              className="flex items-center gap-1 text-xs px-2 py-1 rounded glass-button-ghost hover:text-accent transition-colors"
            >
              <ExternalLink size={14} /> Live
            </Link>
          )}
          {project.repoLink && (
            <Link 
              href={project.repoLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub Repository" 
              className="flex items-center gap-1 text-xs px-2 py-1 rounded glass-button-ghost hover:text-accent transition-colors"
            >
              <Github size={14} /> Code
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
