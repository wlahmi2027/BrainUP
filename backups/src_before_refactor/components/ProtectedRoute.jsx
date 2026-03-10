import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Read the login flag from localStorage
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the protected content
  return children;
}