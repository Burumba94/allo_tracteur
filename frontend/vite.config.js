export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://allo-tracteur.onrender.com',
        changeOrigin: true,
        // ✅ Ne pas modifier le chemin
        rewrite: (path) => path, 
      },
    },
  },
});
