 // src/context/EventContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";
import { gsPublic } from "../api/public.gs";

export const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  async function loadEvents() {
    try {
      setEventsError("");
      setLoadingEvents(true);
      const data = await gsPublic.publicEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setEventsError(e.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const value = useMemo(
    () => ({ events, loadingEvents, eventsError, reloadEvents: loadEvents }),
    [events, loadingEvents, eventsError]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
