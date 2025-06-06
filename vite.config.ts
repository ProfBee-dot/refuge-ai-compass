import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path, { resolve } from 'path'
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        worker: resolve(__dirname, 'src/service-worker.js'),
        emergency: path.resolve(__dirname, 'offline.html')
        
      },
      output: {
        entryFileNames: assetInfo => {

          if (assetInfo.name === 'worker') 
            return 'service-worker.js'

          return 'assets/[name]-[hash].js'
        }
      }
    },
  emptyOutDir: true
}
}));
