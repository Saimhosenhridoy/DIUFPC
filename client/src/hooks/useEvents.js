 // src/hooks/useEvents.js
import { useContext } from "react";
import { EventContext } from "../context/EventContext";

export function useEvents() {
  return useContext(EventContext);
}
