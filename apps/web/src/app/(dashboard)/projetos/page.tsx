import type { Metadata } from 'next';
import { ProjectsList } from '@/components/projects/projects-list';

export const metadata: Metadata = { title: 'Projetos — GPower Studio' };

export default function ProjetosPage() {
  return <ProjectsList />;
}
