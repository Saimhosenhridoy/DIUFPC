const JOIN = import.meta.env.VITE_JOIN_SCRIPT_URL;

async function jget(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params });
  const res = await fetch(`${JOIN}?${qs.toString()}`, { method: "GET" });
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.message || "Join request failed");
  return json.data;
}

async function jpost(action, payload = {}) {
  const url = `${JOIN}?action=${encodeURIComponent(action)}`;
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => body.append(k, v ?? ""));
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
  });
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.message || "Join request failed");
  return json.data;
}

export const joinAdmin = {
  getJoinPageStatus: () => jget("getJoinPageStatus"),
  updateJoinPageStatus: (status, updatedBy) => jpost("updateJoinPageStatus", { status, updatedBy }),
  getApplications: () => jget("getApplications"),
  updateStatus: (applicationId, status, updatedBy) =>
    jpost("updateStatus", { applicationId, status, updatedBy }),
};
