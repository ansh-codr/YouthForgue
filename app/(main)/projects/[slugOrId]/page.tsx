import { ProjectDetailClient } from './ProjectDetailClient';

// Note: No generateStaticParams needed when using Netlify's Next.js runtime
// Dynamic routes work natively without static export configuration

export default function ProjectDetailPage({ params }: { params: { slugOrId: string } }) {
  return <ProjectDetailClient slugOrId={params.slugOrId} />;
}

