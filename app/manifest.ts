import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MedPro',
    short_name: 'MedPro',
    description: 'MedPro - Your Medical Companion App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    scope: '/',
    categories: ['productivity', 'business'],
    prefer_related_applications: false,
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },

      // 🍏 Apple Touch Icon
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
        // Apple doesn't use `purpose`
      }
    ]
  }
}
