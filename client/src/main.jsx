import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AppLockProvider } from "./context/AppLockContext.jsx";

// Wake the (free-tier) API as early as possible; ignore the result
fetch(`${import.meta.env.VITE_API_URL || "/api"}/health`).catch(() => {});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppLockProvider>
          <App />
        </AppLockProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);