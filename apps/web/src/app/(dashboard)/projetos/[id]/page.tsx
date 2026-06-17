import type { Metadata } from 'next';
import { ProjectDetail } from '@/components/projects/project-detail';

export const metadata: Metadata = { title: 'Projeto — GPower Studio' };

export default function ProjetoDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetail projectId={params.id} />;
}
