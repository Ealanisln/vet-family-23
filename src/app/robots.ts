// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',          // Panel de administración
          '/dashboard/',      // Dashboard de usuarios
          '/studio/',         // Sanity Studio
          '/cliente/editar/', // Edición de perfil de cliente
          '/api/',           // Endpoints de API
          '/cliente/mascota/*', // Detalles específicos de mascotas
        ],
      },
      {
        userAgent: 'GPTBot',  // Bloquear crawler de ChatGPT
        disallow: '/',
      },
      {
        userAgent: 'CCBot',   // Bloquear crawler de Claude
        disallow: '/',
      }
    ],
    sitemap: 'https://www.vetforfamily.com/sitemap.xml',
    host: 'https://www.vetforfamily.com',
  }
}