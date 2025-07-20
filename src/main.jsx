// src/main.jsx or index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/Authcontext"; // ✅ Adjust path if needed
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>  {/* ✅ Wrap App in AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
