'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Loader2, Shield, Star, TriangleAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/src/hooks/useProject';
import { useUpdateProject } from '@/src/hooks/useProjects';
import { ImageGallery } from '@/components/ImageGallery';
import { LikeButton } from '@/components/LikeButton';
import { CommentThread } from '@/components/CommentThread/CommentThread';
import { useToast } from '@/hooks/use-toast';
import type { ModerationLogEntry } from '@/src/types/project';
import { getFirebaseDb } from '@/lib/firebaseClient';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FEATURE_FLAGS, REPORTS_COLLECTION } from '@/src/config/constants';

const AdminBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
    <Shield className="h-3 w-3" /> Admin
  </span>
);

export function ProjectDetailClient({ slugOrId }: { slugOrId: string }) {
  const { user } = useAuth();
  const { data: project, isLoading } = useProject(slugOrId);
  const updateMutation = useUpdateProject();
  const { toast } = useToast();

  const isAdmin = Boolean(user?.email?.endsWith('@youthforge.dev'));
  const isOwner = user && project ? user.uid === project.owner.id : false;
  const moderationLogs = useMemo<ModerationLogEntry[]>(() => project?.moderationLogs ?? [], [project]);
  const isModerating = updateMutation.isPending;

  const handleFeatureToggle = async () => {
    if (!project) return;
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        isFeatured: !project.isFeatured,
        moderationLogs: [
          {
            id: `mod-${Date.now()}`,
            actorId: user?.uid || 'admin',
            action: project.isFeatured ? 'unfeature' : 'feature',
            reason: project.isFeatured ? 'Removed from spotlight' : 'Highlighted for visibility',
            createdAt: new Date().toISOString(),
          },
          ...(project.moderationLogs ?? []),
        ],
      });
      toast({ title: project.isFeatured ? 'Project unfeatured' : 'Project featured' });
    } catch (error) {
      toast({ title: 'Unable to update featured status', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleSoftDelete = async () => {
    if (!project) return;
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        visibility: 'deleted',
        moderationLogs: [
          {
            id: `mod-${Date.now()}`,
            actorId: user?.uid || 'admin',
            action: 'soft-delete',
            reason: 'Marked via client',
            createdAt: new Date().toISOString(),
          },
          ...(project.moderationLogs ?? []),
        ],
      });
      toast({ title: 'Project hidden', description: 'Visibility set to deleted.' });
    } catch (error) {
      toast({ title: 'Unable to update visibility', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleReport = async () => {
    if (!project) return;
    const reason = prompt('Describe the issue for review');
    if (!reason) return;
    try {
      if (FEATURE_FLAGS.useFirebaseAdapter) {
        const db = getFirebaseDb();
        await addDoc(collection(db, REPORTS_COLLECTION), {
          projectId: project.id,
          reason,
          reporter: user?.uid || 'anonymous',
          createdAt: serverTimestamp(),
        });
      } else {
        console.info('[reports] mock entry', { projectId: project.id, reason });
      }
      toast({ title: 'Report submitted', description: 'Our moderators will review it shortly.' });
    } catch (error) {
      toast({ title: 'Unable to send report', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-accent" /> : <p>Project not found.</p>}
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide">{project.visibility}</span>
              {project.isFeatured && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <Star className="h-4 w-4 fill-current" /> Featured
                </span>
              )}
              {project.owner.role === 'admin' && <AdminBadge />}
            </div>
            <h1 className="text-4xl font-bold leading-tight">{project.title}</h1>
            <p className="text-lg text-muted-foreground">{project.summary}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Published {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{project.likesCount} likes</span>
              <span>•</span>
              <span>{project.commentsCount} comments</span>
            </div>
          </div>

          <ImageGallery media={project.media} />

          <div className="prose prose-invert max-w-none text-base leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag: string) => (
              <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold">Owner</h3>
            <div className="mt-4 flex items-center gap-4">
              <Image
                src={project.owner.avatarUrl || 'https://avatars.githubusercontent.com/u/1?v=4'}
                alt={project.owner.displayName}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-base font-semibold">{project.owner.displayName}</p>
                <p className="text-sm text-muted-foreground">{project.owner.role || 'member'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Engagement</h3>
              <LikeButton projectId={project.id} initialCount={project.likesCount} initialLiked={project.likedByViewer} />
            </div>
            <CommentThread projectId={project.id} />
          </div>
        </div>

        <aside className="w-full max-w-sm space-y-6">
          <div className="rounded-3xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold">Admin tools</h3>
            <p className="text-sm text-muted-foreground">Owner & YouthForge admins can moderate visibility.</p>
            <div className="mt-4 space-y-3 text-sm">
              <button
                type="button"
                onClick={handleFeatureToggle}
                className="glass-button w-full disabled:opacity-50"
                disabled={!isAdmin || isModerating}
              >
                {project.isFeatured ? 'Remove from featured row' : 'Feature project'}
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={(!isAdmin && !isOwner) || isModerating}
                className="glass-button-ghost w-full border border-red-500/40 text-red-300 disabled:opacity-50"
              >
                Soft delete
              </button>
              <button type="button" onClick={handleReport} className="glass-button-ghost w-full text-amber-200">
                <TriangleAlert className="mr-2 inline h-4 w-4" /> Report project
              </button>
            </div>
          </div>

          {moderationLogs.length > 0 && (
            <div className="rounded-3xl border border-white/10 p-5 text-sm">
              <h3 className="text-lg font-semibold">Moderation log</h3>
              <ul className="mt-4 space-y-3">
                {moderationLogs.slice(0, 5).map((log: ModerationLogEntry) => (
                  <li key={log.id} className="rounded-xl bg-white/5 p-3">
                    <p className="font-medium capitalize">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.reason || '—'} • {new Date(log.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
