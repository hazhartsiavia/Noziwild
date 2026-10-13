import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    // Toujours le port 5173 : c'est l'adresse autorisée dans la console Google (connexion Google)
    // et dans CLIENT_URL. Si le port est pris, Vite s'arrête au lieu de passer sur 5174.
    port: 5173,
    strictPort: true,
    // Les appels /api/... et les photos /uploads/... partent vers le serveur Express
    proxy: {
      '/api': 'http://localhost:5002',
      '/uploads': 'http://localhost:5002'
    }
  }
})
