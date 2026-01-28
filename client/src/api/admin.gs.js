 // src/api/admin.gs.js

const BASE = import.meta.env.VITE_ADMIN_GS_URL;
const KEY = import.meta.env.VITE_ADMIN_GS_KEY;

function mustHaveEnv_() {
  if (!BASE) throw new Error("Missing VITE_ADMIN_GS_URL in .env");
  if (!KEY) throw new Error("Missing VITE_ADMIN_GS_KEY in .env");
}

async function get(action, params = {}) {
  mustHaveEnv_();

  const qs = new URLSearchParams({
    action,
    key: KEY,
    ...params,
  });

  const res = await fetch(`${BASE}?${qs.toString()}`, { method: "GET" });
  const json = await res.json();

  if (!json?.success) throw new Error(json?.message || "Request failed");
  return json.data;
}

async function post(action, payload = {}) {
  mustHaveEnv_();

  const url = `${BASE}?action=${encodeURIComponent(action)}&key=${encodeURIComponent(
    KEY
  )}`;

  const body = new URLSearchParams();
  Object.entries(payload || {}).forEach(([k, v]) =>
    body.append(k, v ?? "")
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: body.toString(),
  });

  const json = await res.json();
  if (!json?.success) throw new Error(json?.message || "Request failed");
  return json.data;
}

export const gsAdmin = {
  /* =========================
     DASHBOARD
     ========================= */
  metrics: () => get("metrics"),
  recentActivity: (limit = 20) => get("recentActivity", { limit }),

  /* =========================
     LISTS
     ========================= */
  listEvents: () => get("listEvents"),
  listSubmissions: () => get("listSubmissions"),
  listAnnouncements: () => get("listAnnouncements"),
  listResults: () => get("listResults"),
  listUsers: () => get("listUsers"),

  /* =========================
     EVENTS
     ========================= */
  createEvent: (p) => post("createEvent", p),
  updateEvent: (p) => post("updateEvent", p),
  deleteEvent: (id, updatedBy) => post("deleteEvent", { id, updatedBy }),

  /* =========================
     SUBMISSIONS
     ========================= */
  updateSubmissionStatus: (id, status, updatedBy) =>
    post("updateSubmissionStatus", { id, status, updatedBy }),

  /* =========================
     ANNOUNCEMENTS
     ========================= */
  createAnnouncement: (p) => post("createAnnouncement", p),
  updateAnnouncement: (p) => post("updateAnnouncement", p),
  deleteAnnouncement: (id, updatedBy) =>
    post("deleteAnnouncement", { id, updatedBy }),

  /* =========================
     RESULTS
     ========================= */
  createResult: (p) => post("createResult", p),
  batchAddResults: (results, updatedBy) =>
    post("batchAddResults", {
      results: JSON.stringify(results || []),
      updatedBy,
    }),
  updateResult: (p) => post("updateResult", p),
  deleteResult: (id, updatedBy) => post("deleteResult", { id, updatedBy }),

  /* =========================
     USERS
     ========================= */
  upsertUser: (p) => post("upsertUser", p),
  updateUserRole: (id, role, updatedBy) =>
    post("updateUserRole", { id, role, updatedBy }),

  /* =========================
     SETTINGS
     ========================= */
  getSetting: (key) => get("getSetting", { key }),
  setSetting: (key, value, updatedBy) =>
    post("setSetting", { key, value, updatedBy }),
};
