// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/indicadores',
  cacheMaxMemorySize: 0, // el caché de páginas e imágenes se guarda en disco, no en RAM
};

export default nextConfig;