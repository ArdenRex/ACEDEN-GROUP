import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aceden',
    short_name: 'Aceden',
    description: 'Give it the work.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f1',
    theme_color: '#faf7f1',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
