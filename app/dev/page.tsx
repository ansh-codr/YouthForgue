'use client';

import ProjectCard from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { TagPill } from '@/components/TagPill/TagPill';
import CommentThread from '@/components/CommentThread/CommentThread';

export default function DevPage() {
  const { projects } = useProjects();
  const project = projects[0];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-4">Project Card</h2>
        {project && <ProjectCard project={project} />}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Tag Pills</h2>
        <div className="flex gap-2 flex-wrap">
          <TagPill label="React" />
          <TagPill label="TypeScript" />
          <TagPill label="AI" color="#8b5cf6" />
        </div>
      </section>

      {project && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <CommentThread projectId={project.id} />
        </section>
      )}

    </main>
  );
}
