/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Advanced Performance Optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Enable compression
  compress: true,
  
  // Advanced caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widgets.coingecko.com; style-src 'self' 'unsafe-inline' https://widgets.coingecko.com;"
          },
          // Cache static assets aggressively
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // API routes with different caching strategies
      {
        source: '/api/bonk/price',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=30, stale-while-revalidate=60'
          }
        ]
      },
      {
        source: '/api/bonk/sentiment',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600'
          }
        ]
      },
      {
        source: '/api/bonk/holders',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120'
          }
        ]
      },
      // Static pages with longer cache
      {
        source: '/dashboard',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=7200'
          }
        ]
      }
    ]
  },
  
  // Optimize bundle splitting for production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Advanced bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // React specific
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // UI components
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Solana related
          solana: {
            test: /[\\/]node_modules[\\/](@solana)[\\/]/,
            name: 'solana',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Common chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true,
          },
        },
      };
      
      // Optimize module resolution
      config.resolve.modules = ['node_modules'];
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    // Add bundle analyzer in development (disabled for ES modules compatibility)
    // if (dev && !isServer) {
    //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    //   config.plugins.push(
    //     new BundleAnalyzerPlugin({
    //       analyzerMode: 'static',
    //       openAnalyzer: false,
    //     })
    //   );
    // }
    
    return config;
  },
  
  // Optimize for production
  productionBrowserSourceMaps: false,
  
  // PWA support (optional)
  async rewrites() {
    return [
      // API route optimization
      {
        source: '/api/bonk/:path*',
        destination: '/api/bonk/:path*',
      },
      // Static asset optimization
      {
        source: '/static/:path*',
        destination: '/_next/static/:path*',
      },
    ];
  },
  
  // Environment variables for optimization
  env: {
    NEXT_PUBLIC_OPTIMIZATION_LEVEL: 'high',
    NEXT_PUBLIC_CACHE_STRATEGY: 'aggressive',
  },
};

export default nextConfig;
