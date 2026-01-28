 // src/api/public.gs.js
const BASE = import.meta.env.VITE_ADMIN_GS_URL;

async function get(action, params = {}) {
  if (!BASE) throw new Error("Missing VITE_ADMIN_GS_URL in .env");

  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${BASE}?${qs}`);
  const json = await res.json();

  if (!json?.success) throw new Error(json?.message || "Request failed");
  return json.data;
}

async function post(action, payload = {}) {
  if (!BASE) throw new Error("Missing VITE_ADMIN_GS_URL in .env");

  const qs = new URLSearchParams({ action }).toString();
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => body.append(k, v ?? ""));

  const res = await fetch(`${BASE}?${qs}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: body.toString(),
  });

  const json = await res.json();
  if (!json?.success) throw new Error(json?.message || "Request failed");
  return json.data;
}

export const gsPublic = {
  announcements: () => get("publicAnnouncements"),
  results: () => get("publicResults"),

  // events
  publicEvents: () => get("publicEvents"),
  publicEventBySlug: (slug) => get("publicEventBySlug", { slug }),

  // event registration (creates reg_<slug> automatically)
  registerEvent: (payload) => post("registerEvent", payload),
};
