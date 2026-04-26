// backend/src/server.js

// Import des dépendances principales
import express from "express"; // Framework web (routes, middleware, serveur)
import cors from "cors"; // Permet au frontend (React) d'appeler l'API
import dotenv from "dotenv"; // Charge les variables d'environnement depuis un fichier .env

// Active dotenv (lit le fichier .env si présent)
dotenv.config();

// Crée l'application Express
const app = express();

// Middleware : autorise les requêtes cross-origin (frontend <-> backend)
app.use(cors());

//  Middleware : transforme automatiquement le JSON reçu en req.body
app.use(express.json());

// Route test (health check)
// But : vérifier rapidement que le backend tourne bien
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "BrainUP API running ✅",
  });
});

// Choix du port : si PORT existe dans .env on l’utilise, sinon 5000
const PORT = process.env.PORT || 5000;

// Démarre le serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
