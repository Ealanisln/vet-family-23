// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getBlogPosts } from '@/app/actions/get-blog-posts'

const SITE_URL = 'https://www.vetforfamily.com'

const getFullUrl = (path: string = '') => {
  return `${SITE_URL}${path}`.replace(/\/$/, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: getFullUrl(),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    // Páginas de servicios principales
    {
      url: getFullUrl('/planes-veterinarios'),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: getFullUrl('/microchip'),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: getFullUrl('/reservar-cita'),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: getFullUrl('/solicita-tu-cita'),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: getFullUrl('/promociones'),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Área de clientes
    {
      url: getFullUrl('/cliente'),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: getFullUrl('/cliente/editar'),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    // Blog
    {
      url: getFullUrl('/blog'),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // Obtener posts del blog
  const blogPosts = await getBlogPosts()
  
  const dynamicPages = [
    ...(blogPosts?.map(post => ({
      url: getFullUrl(`/blog/${post.slug.current}`),
      lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    })) ?? []),
  ]

  // Rutas dinámicas que no necesitan estar en el sitemap:
  // - /admin/...
  // - /cliente/mascota/[petId]
  // - /dashboard
  // - /studio/[[...index]]

  return [
    ...staticPages,
    ...dynamicPages
  ]
}