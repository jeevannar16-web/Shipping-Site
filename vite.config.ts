import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-three',
              test: /node_modules[\\/](three|@react-three|postprocessing)/,
              priority: 20,
            },
            {
              name: 'vendor-anim',
              test: /node_modules[\\/](gsap|lenis)/,
              priority: 15,
            },
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router|lucide-react)/,
              priority: 10,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              minSize: 20000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
})