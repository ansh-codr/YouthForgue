import { ProjectDetailClient } from './ProjectDetailClient';

// Force dynamic rendering to prevent build-time data collection issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ProjectDetailPage({ params }: { params: { slugOrId: string } }) {
  return <ProjectDetailClient slugOrId={params.slugOrId} />;
}

