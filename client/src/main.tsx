import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
// contexts
import { WorkoutContextProvider } from "./context/WorkoutContext.tsx";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

if (import.meta.env.PROD) {
  disableReactDevTools();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <WorkoutContextProvider>
          <App />
        </WorkoutContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
