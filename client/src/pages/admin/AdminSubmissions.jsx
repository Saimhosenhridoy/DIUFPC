 import { useEffect, useMemo, useState } from "react";
import { gsAdmin } from "../../api/admin.gs";
import { useAuth } from "../../hooks/useAuth";

export default function AdminSubmissions() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const data = await gsAdmin.listSubmissions();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) =>
      `${x.name || ""} ${x.email || ""} ${x.category || ""}`.toLowerCase().includes(s)
    );
  }, [items, q]);

  const setStatus = async (id, status) => {
    try {
      await gsAdmin.updateSubmissionStatus(id, status, user?.email || "admin");
      load();
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  return (
    <div className="app-card p-6">
      <div className="text-xl font-extrabold text-slate-900">Photo Submissions</div>
      <div className="contact-underline mt-2" />

      <div className="mt-4 flex gap-2">
        <input className="contact-input w-full" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60" onClick={load}>Refresh</button>
      </div>

      {err && <div className="mt-4 text-red-700 font-bold">{err}</div>}

      <div className="mt-4 space-y-2">
        {filtered.map((x) => (
          <div key={x.id} className="app-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-extrabold text-slate-900">{x.name || "Unnamed"}</div>
              <div className="text-sm text-slate-700">{x.email} • {x.category}</div>
              <div className="text-xs text-slate-600 mt-1">Status: {x.status || "PENDING"}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatus(x.id, "APPROVED")} className="px-3 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500">
                Approve
              </button>
              <button onClick={() => setStatus(x.id, "REJECTED")} className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500">
                Reject
              </button>
              <button onClick={() => setStatus(x.id, "PENDING")} className="app-card px-3 py-2 font-bold text-slate-900 hover:bg-white/60">
                Pending
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
