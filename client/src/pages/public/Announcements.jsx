import { useEffect, useState } from "react";
import { gsPublic } from "../../api/public.gs";

const paragraphStyle = {
  textAlign: "justify",
  textJustify: "inter-word",
  hyphens: "auto",
  WebkitHyphens: "auto",
  overflowWrap: "break-word",
  wordBreak: "normal",
  textAlignLast: "left",
};

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
          <h1 className="text-3xl font-extrabold text-slate-50">
            Announcements
          </h1>
          <div className="contact-underline mx-auto mt-2" />
        </div>

        {loading && <div className="app-card p-5">Loading...</div>}
        {err && <div className="app-card p-5 text-red-300 font-bold">{err}</div>}

        {!loading && !err && data.length === 0 && (
          <div className="app-card p-5">No announcements yet.</div>
        )}

        {data.map((a) => (
          <div key={a.id} className="app-card p-6 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-slate-50 min-w-0 break-words">{a.title}</h2>
              <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-[#102746]/85 text-slate-50 shrink-0">
                {a.priority || "NORMAL"}
              </span>
            </div>

            {/^https?:\/\//i.test(String(a.imageUrl || "")) && (
              <img src={a.imageUrl} alt={a.title || "Announcement image"}
                loading="lazy" className="mt-4 w-full max-h-[420px] object-contain rounded-xl border border-blue-400/25 bg-[#07152D]"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            )}

            <p lang="en" style={paragraphStyle} className="mt-2 text-slate-300 whitespace-pre-line leading-relaxed">
              {a.message}
            </p>

            {a.linkTitle && /^https?:\/\//i.test(String(a.linkUrl || "")) && (
              <a href={a.linkUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex mt-4 items-center gap-2 rounded-xl bg-[#126de9] px-5 py-2.5 font-bold text-white hover:bg-[#2588ff] transition break-all">
                {a.linkTitle} ↗
              </a>
            )}

            <div className="mt-2 text-xs text-slate-400">
              {a.createdAt ? String(a.createdAt) : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
