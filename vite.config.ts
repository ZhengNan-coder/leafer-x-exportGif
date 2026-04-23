import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    root: resolve(__dirname, 'demo'),
    publicDir: resolve(__dirname, 'public'),
    server: {
        proxy: {
            '/gif-proxy': {
                target: 'https://p2-ad.adkwai.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/gif-proxy/, ''),
            },
        },
    },
    resolve: {
        alias: {
            '../src': resolve(__dirname, 'src'),
        },
    },
})
