import type { Metadata } from 'next';
import { ProjectForm } from '@/components/projects/project-form';

export const metadata: Metadata = { title: 'Novo Projeto — GPower Studio' };

export default function NovoProjetoPage() {
  return <ProjectForm />;
}
