 import { useEffect, useState } from "react";
import { gsPublic } from "../../api/public.gs";

export default function Announcements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    gsPublic
      .announcements()
      .then((d) => alive && setData(Array.isArray(d) ? d : []))
      .catch((e) => alive && setErr(e.message || "Failed to load"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="app-card p-7 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Announcements
          </h1>
          <div className="contact-underline mx-auto mt-2" />
        </div>

        {loading && <div className="app-card p-5">Loading...</div>}
        {err && <div className="app-card p-5 text-red-600 font-bold">{err}</div>}

        {!loading && !err && data.length === 0 && (
          <div className="app-card p-5">No announcements yet.</div>
        )}

        {data.map((a) => (
          <div key={a.id} className="app-card p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">{a.title}</h2>

              <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-white/50 text-slate-900">
                {a.priority || "NORMAL"}
              </span>
            </div>

            <p className="mt-2 text-slate-700 whitespace-pre-line">{a.message}</p>

            <div className="mt-2 text-xs text-slate-500">
              {a.createdAt ? String(a.createdAt) : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
