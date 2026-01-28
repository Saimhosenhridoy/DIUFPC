import { eventsSeed } from "../data/events";

export async function getEventsApi() {
  return eventsSeed;
}

export async function getEventBySlugApi(slug) {
  return eventsSeed.find((e) => e.slug === slug) || null;
}
