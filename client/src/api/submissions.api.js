const KEY = "dfpc_submissions_v1";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function createSubmissionApi(eventSlug, payload) {
  const all = readAll();
  const item = {
    id: crypto.randomUUID(),
    eventSlug,
    status: "submitted",
    createdAt: new Date().toISOString(),
    ...payload,
  };
  all.unshift(item);
  writeAll(all);
  return item;
}

export async function getMySubmissionsApi() {
  return readAll();
}
