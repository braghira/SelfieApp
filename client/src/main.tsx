import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
// contexts
import { ActivityContextProvider } from "./context/ActivityContext.tsx";
import { EventContextProvider } from "./context/EventContext.tsx";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { NotificationContextProvider } from "./context/NotificationContext.tsx";

// desables react dev tools in production
if (import.meta.env.PROD) {
  disableReactDevTools();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <NotificationContextProvider>
          <EventContextProvider>
            <ActivityContextProvider>
              <App />
            </ActivityContextProvider>
          </EventContextProvider>
        </NotificationContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
