import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'MHA Academy', short_name: 'MHA',
    description: 'Ton académie, ta communauté et tes défis.',
    start_url: '/', scope: '/', display: 'standalone', orientation: 'portrait-primary',
    background_color: '#0f1720', theme_color: '#102d1f', lang: 'fr',
    categories: ['education', 'social'],
    icons: [{ src: '/icons/mha-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
  };
}