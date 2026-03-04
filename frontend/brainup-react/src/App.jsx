import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Accueil from "./pages/Accueil";
import Cours from "./pages/Cours";
import TableauDeBord from "./pages/TableauDeBord";
import Recommandations from "./pages/Recommandations";
import Quiz from "./pages/Quiz";
import Chatbot from "./pages/Chatbot";
import Profil from "./pages/Profil";
import Deconnexion from "./pages/Deconnexion";

import './index.css';
import './App.css';

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
  <Routes>
    {/* Public route */}
    <Route path="/login" element={<Login />} />

    {/* All protected routes inside Layout */}
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Accueil />} />
      <Route path="/cours" element={<Cours />} />
      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      <Route path="/recommandations" element={<Recommandations />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/deconnexion" element={<Deconnexion />} />
    </Route>
  </Routes>
  );
}