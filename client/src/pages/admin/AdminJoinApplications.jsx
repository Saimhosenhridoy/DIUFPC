import { useEffect, useMemo, useState } from "react";
import { joinAdmin } from "../../api/join.admin";
import { useAuth } from "../../hooks/useAuth";

export default function AdminJoinApplications() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [err, setErr] = useState("");

  const [joinStatus, setJoinStatus] = useState("enabled");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all|pending|approved|rejected

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return apps
      .filter((a) => {
        if (status === "all") return true;
        return String(a.Status || "").toLowerCase() === status;
      })
      .filter((a) => {
        if (!s) return true;
        const blob = [
          a["Full Name"] ?? a.Name ?? "",
          a.Email ?? "",
          a["Student ID"] ?? a.StudentID ?? "",
          a.Department ?? "",
          a.Phone ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(s);
      });
  }, [apps, q, status]);

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const js = await joinAdmin.getJoinPageStatus();
      setJoinStatus(js?.status || "enabled");

      const data = await joinAdmin.getApplications();
      setApps(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleJoin = async () => {
    const next = joinStatus === "enabled" ? "disabled" : "enabled";
    try {
      await joinAdmin.updateJoinPageStatus(next, user?.email || "admin");
      setJoinStatus(next);
    } catch (e) {
      alert(e.message || "Failed to update join status");
    }
  };

  const updateStatus = async (timestamp, newStatus) => {
    try {
      await joinAdmin.updateStatus(timestamp, newStatus, user?.email || "admin");
      await load();
    } catch (e) {
      alert(e.message || "Failed to update status");
    }
  };

  return (
    <div className="app-card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xl font-extrabold text-slate-900">Join Applications</div>
           
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
          >
            Refresh
          </button>
          <button
            onClick={toggleJoin}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              joinStatus === "enabled"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {joinStatus === "enabled" ? "Disable Join" : "Enable Join"}
          </button>
        </div>
      </div>

      <div className="mt-4 app-card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700">
          Current Join Status:{" "}
          <b className={joinStatus === "enabled" ? "text-green-700" : "text-red-700"}>
            {joinStatus.toUpperCase()}
          </b>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            className="contact-input sm:w-72"
            placeholder="Search by name/email/id..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="contact-input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {err && <div className="mt-4 text-red-700 font-bold">{err}</div>}

      {loading ? (
        <div className="mt-4 text-slate-700">Loading applications...</div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-slate-700">No applications found.</div>
          ) : (
            filtered.map((a) => {
              const ts = a.Timestamp || a["Timestamp"];
              const name = a["Full Name"] || a.Name || "";
              const email = a.Email || "";
              const sid = a["Student ID"] || a.StudentID || "";
              const dept = a.Department || "";
              const st = String(a.Status || "pending").toLowerCase();

              const photoUrl = a.PhotoURL || a["Photo URL"] || a.photoUrl || "";
              const fb = a.FacebookLink || a["Facebook Profile Link"] || "";

              return (
                <div key={ts} className="app-card p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-extrabold text-slate-900">{name || "(No name)"}</div>
                      <div className="text-sm text-slate-700 mt-1">
                        <b>Email:</b> {email} • <b>ID:</b> {sid} • <b>Dept:</b> {dept}
                      </div>
                      <div className="text-sm text-slate-700 mt-1">
                        <b>Status:</b>{" "}
                        <span
                          className={`font-extrabold ${
                            st === "approved" ? "text-green-700" : st === "rejected" ? "text-red-700" : "text-amber-700"
                          }`}
                        >
                          {st.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">Timestamp: {String(ts)}</div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {photoUrl ? (
                          <a
                            className="app-card px-3 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                            href={photoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Photo
                          </a>
                        ) : null}

                        {fb ? (
                          <a
                            className="app-card px-3 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                            href={fb.startsWith("http") ? fb : `https://${fb}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Facebook
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(ts, "approved")}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(ts, "rejected")}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(ts, "pending")}
                        className="app-card px-4 py-2 font-bold text-slate-900 hover:bg-white/60 transition"
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
