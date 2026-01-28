 import { useEffect, useMemo, useState } from "react";

const GS_URL = import.meta.env.VITE_ADMIN_GS_URL;
const GS_KEY = import.meta.env.VITE_ADMIN_GS_KEY;

export default function Results() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  const fetchResults = async () => {
    try {
      setErr("");
      setLoading(true);

      const qs = new URLSearchParams({
        action: "listResults",
        key: GS_KEY,
      }).toString();

      const res = await fetch(`${GS_URL}?${qs}`);
      const json = await res.json();

      if (!json?.success) {
        throw new Error(json?.message || "Failed to load results");
      }

      setRows(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();

    const published = rows.filter(
      (r) => String(r.status || "PUBLISHED") === "PUBLISHED"
    );

    const filtered = published.filter((r) => {
      if (!q) return true;
      const blob = [
        r.eventTitle,
        r.category,
        r.winnerName,
        r.institute,
        r.winnerEmail,
        r.position,
        r.notes,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });

    // group: eventTitle -> category -> winners[]
    const map = new Map();

    filtered.forEach((r) => {
      const eventTitle = String(r.eventTitle || "Untitled Event").trim();
      const category = String(r.category || "General").trim();

      if (!map.has(eventTitle)) map.set(eventTitle, new Map());
      const catMap = map.get(eventTitle);

      if (!catMap.has(category)) catMap.set(category, []);
      catMap.get(category).push({
        id: r.id || `${eventTitle}-${category}-${r.winnerName}-${r.position}`,
        winnerName: String(r.winnerName || "").trim(),
        institute: String(r.institute || "").trim(),
        winnerEmail: String(r.winnerEmail || "").trim(),
        position: String(r.position || "").trim(),
        notes: String(r.notes || "").trim(),
        createdAt: String(r.createdAt || ""),
      });
    });

    const out = Array.from(map.entries()).map(([eventTitle, catMap]) => {
      const categories = Array.from(catMap.entries()).map(
        ([category, winners]) => {
          winners.sort((a, b) =>
            (a.position || "").localeCompare(b.position || "")
          );
          return { category, winners };
        }
      );
      return { eventTitle, categories };
    });

    return out;
  }, [rows, query]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="app-card p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
            Results
          </h1>
          <div className="contact-underline mx-auto mt-3" />
          <p className="mt-4 text-slate-700">
            Event-wise published results of DIUFPC.
          </p>

          {/* Search */}
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
                  placeholder="Search event / category / winner..."
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
        </div>

        {err && <div className="app-card p-5 text-red-600 font-bold">{err}</div>}

        {loading ? (
          <div className="app-card p-6 text-slate-700">Loading results...</div>
        ) : grouped.length === 0 ? (
          <div className="app-card p-6 text-slate-700">
            No published results yet.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((ev) => (
              <div key={ev.eventTitle} className="app-card p-7">
                <div className="text-2xl font-extrabold text-slate-900">
                  {ev.eventTitle}
                </div>
                <div className="contact-underline mt-2" />

                <div className="mt-5 space-y-4">
                  {ev.categories.map((c) => (
                    <div key={c.category} className="app-card p-5">
                      <div className="text-lg font-extrabold text-slate-900">
                        {c.category}
                      </div>

                      <div className="mt-3 space-y-2">
                        {c.winners.map((w) => {
                          // ✅ Sequence: Name → Institute → Mail → Position → Notes
                          // ✅ All normal (unbold); ONLY position bold
                          const parts = [];
                          if (w.winnerName) parts.push(w.winnerName);
                          if (w.institute) parts.push(w.institute);
                          if (w.winnerEmail) parts.push(w.winnerEmail);

                          return (
                            <div key={w.id} className="app-card p-4">
                              <div className="text-sm md:text-base text-slate-800 leading-relaxed">
                                <span>{parts.length ? parts.join(" • ") : "Winner"}</span>

                                {w.position ? (
                                  <span>
                                    {" "}
                                    • <span className="font-extrabold">{w.position}</span>
                                  </span>
                                ) : null}

                                {w.notes ? <span> • {w.notes}</span> : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-slate-600 text-center pb-6">
          DIUFPC • Results
        </div>
      </div>
    </div>
  );
}
