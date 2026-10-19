 import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { gsAdmin } from "../../api/admin.gs";
import { useAuth } from "../../hooks/useAuth";

const navLinkClass = ({ isActive }) =>
  `w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition
   ${isActive ? "bg-[#126de9] text-white" : "text-[#f4f8ff] hover:bg-[#123762]/85"}`;

function TitleForPath(pathname) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.includes("/admin/join-applications")) return "Join Applications";
  if (pathname.includes("/admin/events")) return "Events";
  
  if (pathname.includes("/admin/announcements")) return "Announcements";
  if (pathname.includes("/admin/results")) return "Results";
  return "Admin";
}

export default function AdminHome() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const pageTitle = useMemo(
    () => TitleForPath(location.pathname),
    [location.pathname]
  );

  const menu = useMemo(
    () => [
      { to: "/admin", label: "Dashboard", badge: "" },
      { to: "/admin/join-applications", label: "Join Applications", badge: "" },
      { to: "/admin/events", label: "Events", badge: "" },
       
      { to: "/admin/announcements", label: "Announcements", badge: "" },
      { to: "/admin/results", label: "Results", badge: "" },
    ],
    []
  );

  const loadDashboard = async () => {
    try {
      setErr("");
      setLoading(true);

      const m = await gsAdmin.metrics();
      setMetrics(m);

      // ✅ optional recentActivity
      try {
        const a = await gsAdmin.recentActivity();
        setActivity(Array.isArray(a) ? a : []);
      } catch {
        setActivity([]);
      }
    } catch (e) {
      setErr(e.message || "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/admin") loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Topbar */}
        <div className="app-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold text-[#f4f8ff]">
              {pageTitle}
            </div>
            <div className="text-sm text-[#b8cce8] mt-1">
              Signed in as <b>{user?.email}</b>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="app-card px-4 py-2 font-bold text-[#f4f8ff] hover:bg-[#123762]/85 transition"
              onClick={() => nav("/")}
            >
              Go Home
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-[#126de9] text-white font-bold hover:bg-[#2588ff] transition"
              onClick={async () => {
                await logout();
                nav("/admin-login");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="app-card p-4 lg:sticky lg:top-6 h-fit">
            <div className="text-sm font-extrabold text-[#f4f8ff] mb-3">
              Admin Menu
            </div>

            <div className="space-y-2">
              {menu.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.to === "/admin"}
                  className={navLinkClass}
                >
                  <span>{m.label}</span>
                  {m.badge ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#164477]/55">
                      {m.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>

            <div className="mt-4 text-xs text-[#98b4d7]">Admin Panel • DIUFPC</div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3 space-y-4">
            {/* Child page renders here */}
            <Outlet />

            {/* Dashboard widgets only on /admin */}
            {location.pathname === "/admin" && (
              <>
                <section className="app-card p-6">
                  <div className="text-xl font-extrabold text-[#f4f8ff]">
                    Dashboard Overview
                  </div>
                  <div className="contact-underline mt-2" />

                  {err && (
                    <div className="mt-4 text-red-700 font-bold">{err}</div>
                  )}

                  {!metrics || loading ? (
                    <div className="mt-4 text-[#b8cce8]">Loading metrics...</div>
                  ) : (
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Stat title="Events" value={metrics.events} />
                       
                      <Stat title="Results" value={metrics.results} />
                    </div>
                  )}
                </section>

                <section className="app-card p-6">
                  <div className="text-xl font-extrabold text-[#f4f8ff]">
                    Recent Activity
                  </div>
                  <div className="contact-underline mt-2" />

                  {activity.length === 0 ? (
                    <div className="mt-4 text-[#b8cce8]">No activity yet.</div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {activity.slice(0, 12).map((a) => (
                        <div
                          key={a.id || `${a.createdAt}-${a.action}`}
                          className="app-card p-4"
                        >
                          <div className="font-bold text-[#f4f8ff]">{a.action}</div>
                          <div className="text-sm text-[#b8cce8]">{a.details}</div>
                          <div className="text-xs text-[#98b4d7] mt-1">
                            by <b>{a.by}</b> • {String(a.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="text-xs text-[#98b4d7] text-center pb-6">
                  DIUFPC Admin Panel
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="app-card p-4">
      <div className="text-sm text-[#b8cce8] font-semibold">{title}</div>
      <div className="text-3xl font-extrabold text-[#f4f8ff] mt-1">
        {value ?? 0}
      </div>
    </div>
  );
}
