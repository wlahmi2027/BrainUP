// frontend/postcss.config.js
// Configuration PostCSS pour Tailwind (version récente)

export default {
  plugins: {
    // ✅ IMPORTANT: Tailwind est maintenant un plugin PostCSS séparé
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
