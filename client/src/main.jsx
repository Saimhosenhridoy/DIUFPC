 import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

import { ClerkProvider } from "@clerk/react-router";

import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import { SubmissionProvider } from "./context/SubmissionContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ Router must wrap ClerkProvider */}
    <BrowserRouter>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <AuthProvider>
          <EventProvider>
            <SubmissionProvider>
              <App />
            </SubmissionProvider>
          </EventProvider>
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);

/* ===============================
   GLOBAL .app-card CLICK GLOW
   =============================== */
(function initGlobalCardGlow() {
  if (window.__DIUFPC_CARD_GLOW_BOUND__) return;
  window.__DIUFPC_CARD_GLOW_BOUND__ = true;

  document.addEventListener(
    "pointerdown",
    (e) => {
      const card = e.target.closest(".app-card");
      if (!card) return;

      card.classList.add("is-click-glow");

      clearTimeout(card.__diufpcGlowTimer);
      card.__diufpcGlowTimer = setTimeout(() => {
        card.classList.remove("is-click-glow");
      }, 700);
    },
    true
  );
})();
