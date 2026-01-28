 // src/pages/admin/AdminResults.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const GS_URL = import.meta.env.VITE_ADMIN_GS_URL;
const GS_KEY = import.meta.env.VITE_ADMIN_GS_KEY;

async function getAdmin(action, params = {}) {
  const url = new URL(GS_URL);
  url.searchParams.set("action", action);
  url.searchParams.set("key", GS_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), { method: "GET" });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request failed");
  return json.data;
}

async function postAdmin(action, payload) {
  const res = await fetch(
    `${GS_URL}?action=${action}&key=${encodeURIComponent(GS_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: new URLSearchParams(payload).toString(),
    }
  );

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request failed");
  return json.data;
}

function groupResults(rows) {
  // Group by eventTitle -> category -> winners[]
  const map = new Map();
  (rows || []).forEach((r) => {
    const eventTitle = String(r.eventTitle || "").trim();
    const category = String(r.category || "").trim();
    if (!eventTitle || !category) return;

    if (!map.has(eventTitle)) map.set(eventTitle, new Map());
    const catMap = map.get(eventTitle);
    if (!catMap.has(category)) catMap.set(category, []);

    catMap.get(category).push({
      id: r.id,
      winnerName: r.winnerName || "",
      winnerEmail: r.winnerEmail || "",
      institute: r.institute || "",
      position: r.position || "",
      notes: r.notes || "",
      createdAt: r.createdAt || "",
      updatedAt: r.updatedAt || "",
    });
  });

  // Convert to array
  const out = [];
  for (const [eventTitle, catMap] of map.entries()) {
    const categories = [];
    for (const [name, winners] of catMap.entries()) {
      // stable sort by position (best effort)
      const order = (p) => {
        const s = String(p || "").toLowerCase();
        if (s.includes("1st")) return 1;
        if (s.includes("2nd")) return 2;
        if (s.includes("3rd")) return 3;
        if (s.includes("hon")) return 4;
        if (s.includes("sel")) return 5;
        return 99;
      };
      winners.sort((a, b) => order(a.position) - order(b.position));
      categories.push({ name, winners });
    }
    categories.sort((a, b) => a.name.localeCompare(b.name));
    out.push({ eventTitle, categories });
  }
  out.sort((a, b) => b.eventTitle.localeCompare(a.eventTitle));
  return out;
}

export default function AdminResults() {
  const { user } = useAuth();

  // Create form (batch add)
  const [eventTitle, setEventTitle] = useState("");
  const [categories, setCategories] = useState([
    {
      name: "General",
      winners: [
        {
          winnerName: "",
          winnerEmail: "",
          institute: "",
          position: "1st",
          notes: "",
        },
      ],
    },
  ]);

  // Search / list / edit
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [edit, setEdit] = useState(null); // winner row object
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    if (!eventTitle.trim()) return false;
    for (const c of categories) {
      if (!c.name.trim()) return false;
      for (const w of c.winners) {
        if (!w.winnerName.trim() || !w.position.trim()) return false;
        // email+institute optional? you asked to include them — so require them:
        if (!w.winnerEmail.trim() || !w.institute.trim()) return false;
      }
    }
    return true;
  }, [eventTitle, categories]);

  const addCategory = () => {
    setCategories((p) => [
      ...p,
      {
        name: "",
        winners: [
          {
            winnerName: "",
            winnerEmail: "",
            institute: "",
            position: "1st",
            notes: "",
          },
        ],
      },
    ]);
  };

  const removeCategory = (idx) => {
    setCategories((p) => p.filter((_, i) => i !== idx));
  };

  const updateCategoryName = (idx, val) => {
    setCategories((p) => p.map((c, i) => (i === idx ? { ...c, name: val } : c)));
  };

  const addWinner = (cidx) => {
    setCategories((p) =>
      p.map((c, i) =>
        i === cidx
          ? {
              ...c,
              winners: [
                ...c.winners,
                {
                  winnerName: "",
                  winnerEmail: "",
                  institute: "",
                  position: "2nd",
                  notes: "",
                },
              ],
            }
          : c
      )
    );
  };

  const removeWinner = (cidx, widx) => {
    setCategories((p) =>
      p.map((c, i) =>
        i === cidx ? { ...c, winners: c.winners.filter((_, j) => j !== widx) } : c
      )
    );
  };

  const updateWinner = (cidx, widx, key, val) => {
    setCategories((p) =>
      p.map((c, i) => {
        if (i !== cidx) return c;
        return {
          ...c,
          winners: c.winners.map((w, j) => (j === widx ? { ...w, [key]: val } : w)),
        };
      })
    );
  };

  const loadResults = async () => {
    try {
      setErr("");
      setOk("");
      setLoadingList(true);
      const data = await getAdmin("listResults");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load results");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    setErr("");
    setOk("");

    if (!canSubmit) {
      setErr("Please fill Event Title, Category, Winner Name, Winner Email, Institute & Position.");
      return;
    }

    const flat = [];
    categories.forEach((c) => {
      c.winners.forEach((w) => {
        flat.push({
          eventTitle: eventTitle.trim(),
          category: c.name.trim(),
          winnerName: w.winnerName.trim(),
          winnerEmail: w.winnerEmail.trim(),
          institute: w.institute.trim(),
          position: w.position.trim(),
          notes: w.notes || "",
        });
      });
    });

    try {
      setSaving(true);
      // Needs Apps Script action: batchAddResults
      await postAdmin("batchAddResults", {
        updatedBy: user?.email || "admin",
        results: JSON.stringify(flat),
      });
      setOk(`✅ Added ${flat.length} results successfully!`);
      setEventTitle("");
      setCategories([
        {
          name: "General",
          winners: [
            {
              winnerName: "",
              winnerEmail: "",
              institute: "",
              position: "1st",
              notes: "",
            },
          ],
        },
      ]);
      await loadResults();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredGrouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const grouped = groupResults(rows);

    if (!q) return grouped;

    return grouped
      .map((ev) => {
        const eventMatch = ev.eventTitle.toLowerCase().includes(q);

        const cats = ev.categories
          .map((c) => {
            const catMatch = c.name.toLowerCase().includes(q);
            const winners = c.winners.filter((w) => {
              return (
                catMatch ||
                eventMatch ||
                String(w.winnerName || "").toLowerCase().includes(q) ||
                String(w.winnerEmail || "").toLowerCase().includes(q) ||
                String(w.institute || "").toLowerCase().includes(q) ||
                String(w.position || "").toLowerCase().includes(q)
              );
            });
            if (catMatch || winners.length) return { ...c, winners };
            return null;
          })
          .filter(Boolean);

        if (eventMatch || cats.length) return { ...ev, categories: cats };
        return null;
      })
      .filter(Boolean);
  }, [rows, query]);

  const openEdit = (winner) => {
    setEditErr("");
    setEdit({
      id: winner.id,
      winnerName: winner.winnerName || "",
      winnerEmail: winner.winnerEmail || "",
      institute: winner.institute || "",
      position: winner.position || "",
      notes: winner.notes || "",
    });
  };

  const saveEdit = async () => {
    if (!edit) return;

    if (!edit.winnerName.trim() || !edit.position.trim()) {
      setEditErr("Winner name & position are required.");
      return;
    }
    if (!edit.winnerEmail.trim() || !edit.institute.trim()) {
      setEditErr("Winner email & institute are required.");
      return;
    }

    try {
      setEditSaving(true);
      setEditErr("");
      // Needs Apps Script action: updateResult
      await postAdmin("updateResult", {
        updatedBy: user?.email || "admin",
        id: edit.id,
        winnerName: edit.winnerName.trim(),
        winnerEmail: edit.winnerEmail.trim(),
        institute: edit.institute.trim(),
        position: edit.position.trim(),
        notes: edit.notes || "",
      });
      setOk("✅ Result updated!");
      setEdit(null);
      await loadResults();
    } catch (e) {
      setEditErr(e.message || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteRow = async (id) => {
    if (!id) return;
    if (!confirm("Delete this result?")) return;

    try {
      setErr("");
      setOk("");
      // Needs Apps Script action: deleteResult
      await postAdmin("deleteResult", {
        updatedBy: user?.email || "admin",
        id,
      });
      setOk("✅ Deleted!");
      await loadResults();
    } catch (e) {
      setErr(e.message || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="app-card p-7">
          <h1 className="text-3xl font-extrabold text-slate-900">Results</h1>
          <p className="text-slate-700 mt-2">
            Add multiple categories & winners for one event in a single submit. You can also search, edit and delete.
          </p>

          {/* 🔍 Search Box (same style as public) */}
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-xl app-card p-2 rounded-full">
              <div className="flex items-center gap-2 bg-white/70 border border-slate-900/10 rounded-full px-4 py-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 opacity-70"
                >
                  <path
                    d="M21 21l-4.3-4.3m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-500"
                  placeholder="Search event / category / winner / email / institute..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-white/70 hover:bg-white transition"
                    title="Clear"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <button onClick={loadResults} className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition">
              ↻ Refresh List
            </button>
          </div>
        </div>

        {err && <div className="app-card p-5 text-red-600 font-bold">{err}</div>}
        {ok && <div className="app-card p-5 text-emerald-700 font-bold">{ok}</div>}

        {/* Create (batch add) */}
        <div className="app-card p-6 space-y-4">
          <div className="text-xl font-extrabold text-slate-900">Add Results (Batch)</div>
          <div className="contact-underline mt-2" />

          <label className="font-bold text-slate-900 block mt-4">Event Title *</label>
          <input
            className="contact-input w-full"
            placeholder="e.g., DIUFPC Photo Contest 2026"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />

          {categories.map((c, cidx) => (
            <div key={cidx} className="app-card p-6 space-y-4 mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="font-bold text-slate-900">Category *</label>
                  <input
                    className="contact-input w-full mt-2"
                    placeholder="e.g., Street / Portrait / Wildlife"
                    value={c.name}
                    onChange={(e) => updateCategoryName(cidx, e.target.value)}
                  />
                </div>

                {categories.length > 1 && (
                  <button
                    onClick={() => removeCategory(cidx)}
                    className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                    type="button"
                  >
                    Remove Category
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {c.winners.map((w, widx) => (
                  <div key={widx} className="app-card p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        className="contact-input w-full"
                        placeholder="Winner Name *"
                        value={w.winnerName}
                        onChange={(e) => updateWinner(cidx, widx, "winnerName", e.target.value)}
                      />
                      <input
                        className="contact-input w-full"
                        placeholder="Winner Email *"
                        value={w.winnerEmail}
                        onChange={(e) => updateWinner(cidx, widx, "winnerEmail", e.target.value)}
                      />
                      <input
                        className="contact-input w-full"
                        placeholder="Institute *"
                        value={w.institute}
                        onChange={(e) => updateWinner(cidx, widx, "institute", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        className="contact-input w-full"
                        value={w.position}
                        onChange={(e) => updateWinner(cidx, widx, "position", e.target.value)}
                      >
                        <option value="1st">1st</option>
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="Honorable Mention">Honorable Mention</option>
                        <option value="Selected">Selected</option>
                      </select>

                      <input
                        className="contact-input w-full md:col-span-2"
                        placeholder="Notes (optional)"
                        value={w.notes}
                        onChange={(e) => updateWinner(cidx, widx, "notes", e.target.value)}
                      />
                    </div>

                    {c.winners.length > 1 && (
                      <button
                        onClick={() => removeWinner(cidx, widx)}
                        className="text-sm font-bold text-red-600 hover:underline"
                        type="button"
                      >
                        Remove Winner
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button onClick={() => addWinner(cidx)} className="contact-btn" type="button">
                  + Add Winner
                </button>
                <button
                  onClick={addCategory}
                  className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                  type="button"
                >
                  + Add Category
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="contact-btn w-full disabled:opacity-50 mt-4"
            type="button"
          >
            {saving ? "Saving..." : "Save Results"}
          </button>
        </div>

        {/* Existing results list (grouped like public) */}
        <div className="app-card p-6">
          <div className="text-xl font-extrabold text-slate-900">Published Results</div>
          <div className="contact-underline mt-2" />

          {loadingList ? (
            <div className="mt-4 text-slate-700">Loading results...</div>
          ) : filteredGrouped.length === 0 ? (
            <div className="mt-4 text-slate-700">No results found.</div>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredGrouped.map((ev) => (
                <div key={ev.eventTitle} className="app-card p-5">
                  <div className="text-2xl font-extrabold text-slate-900">{ev.eventTitle}</div>
                  <div className="contact-underline mt-2" />

                  <div className="mt-4 space-y-4">
                    {ev.categories.map((c) => (
                      <div key={c.name} className="app-card p-4">
                        <div className="font-extrabold text-slate-900">{c.name}</div>

                        <div className="mt-3 space-y-2">
                          {c.winners.map((w) => (
                            <div key={w.id} className="app-card p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  <div className="font-bold text-slate-900">
                                    {w.position} — {w.winnerName}
                                  </div>
                                  <div className="text-sm text-slate-700 mt-1">
                                    <span className="font-semibold">Email:</span> {w.winnerEmail || "—"}{" "}
                                    <span className="mx-2">•</span>
                                    <span className="font-semibold">Institute:</span> {w.institute || "—"}
                                  </div>
                                  {w.notes ? (
                                    <div className="text-sm text-slate-700 mt-1">
                                      <span className="font-semibold">Notes:</span> {w.notes}
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                                    onClick={() => openEdit(w)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="app-card px-4 py-2 font-bold text-red-600 hover:bg-white/60 transition"
                                    onClick={() => deleteRow(w.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {w.updatedAt ? (
                                <div className="text-xs text-slate-600 mt-2">
                                  Updated: {String(w.updatedAt)}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit modal */}
        {edit && (
          <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="app-card w-full max-w-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xl font-extrabold text-slate-900">Edit Winner</div>
                <button
                  className="app-card px-3 py-1 font-bold text-slate-900 hover:bg-white/60 transition"
                  onClick={() => setEdit(null)}
                  type="button"
                >
                  ✕
                </button>
              </div>

              {editErr ? <div className="mt-3 text-red-600 font-bold">{editErr}</div> : null}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="font-bold text-slate-900 mb-1">Winner Name *</div>
                  <input
                    className="contact-input w-full"
                    value={edit.winnerName}
                    onChange={(e) => setEdit((p) => ({ ...p, winnerName: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-1">Position *</div>
                  <select
                    className="contact-input w-full"
                    value={edit.position}
                    onChange={(e) => setEdit((p) => ({ ...p, position: e.target.value }))}
                  >
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="Honorable Mention">Honorable Mention</option>
                    <option value="Selected">Selected</option>
                  </select>
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-1">Winner Email *</div>
                  <input
                    className="contact-input w-full"
                    value={edit.winnerEmail}
                    onChange={(e) => setEdit((p) => ({ ...p, winnerEmail: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-1">Institute *</div>
                  <input
                    className="contact-input w-full"
                    value={edit.institute}
                    onChange={(e) => setEdit((p) => ({ ...p, institute: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="font-bold text-slate-900 mb-1">Notes</div>
                  <input
                    className="contact-input w-full"
                    value={edit.notes}
                    onChange={(e) => setEdit((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3 flex-wrap">
                <button
                  type="button"
                  className="contact-btn"
                  disabled={editSaving}
                  onClick={saveEdit}
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                  onClick={() => setEdit(null)}
                >
                  Cancel
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                Note: Apps Script must support actions: <b>listResults</b>, <b>batchAddResults</b>, <b>updateResult</b>, <b>deleteResult</b>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
