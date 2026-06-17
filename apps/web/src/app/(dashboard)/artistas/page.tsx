import type { Metadata } from 'next';
import { ArtistsList } from '@/components/artists/artists-list';

export const metadata: Metadata = {
  title: 'Artistas — GPower Studio',
};

export default function ArtistasPage() {
  return <ArtistsList />;
}
