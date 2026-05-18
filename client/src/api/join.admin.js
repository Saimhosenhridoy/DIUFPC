 const JOIN = import.meta.env.VITE_JOIN_SCRIPT_URL;

async function jget(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params });

  const res = await fetch(`${JOIN}?${qs.toString()}`, {
    method: "GET",
  });

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(text || "Invalid server response");
  }

  if (json.status !== "success") {
    throw new Error(json.message || "Join request failed");
  }

  return json.data;
}

export const joinAdmin = {
  getJoinPageStatus: () => jget("getJoinPageStatus"),

  getApplications: () => jget("getApplications"),

  updateJoinPageStatus: (status, updatedBy) =>
    jget("updateJoinPageStatus", {
      status,
      updatedBy,
    }),

  updateStatus: (timestamp, status, updatedBy) =>
    jget("updateStatus", {
      timestamp,
      status,
      updatedBy,
    }),
};