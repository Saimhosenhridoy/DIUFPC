// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";

/* Desktop nav: same active states and navigation functionality. */
const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
   ${
     isActive
       ? "bg-blue-500/20 text-white ring-1 ring-blue-400/40 shadow-[0_0_16px_rgba(19,120,255,0.18)]"
       : "text-slate-300 hover:text-sky-100 hover:bg-blue-400/10"
   }`;

/* Desktop Join Us */
const joinClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
   ${
     isActive
       ? "bg-sky-200 text-[#06162e] shadow-[0_0_18px_rgba(93,181,255,0.32)]"
       : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(19,120,255,0.20)]"
   }`;

/* Desktop Admin: color only; ADMIN-only permission unchanged. */
const adminClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
   ${
     isActive
       ? "bg-sky-300/25 text-white ring-1 ring-sky-300/50 shadow-inner"
       : "bg-[#164c94] text-white hover:bg-blue-600 shadow"
   }`;

/* Mobile dropdown item (fit-content, no extra right space). */
const mobileItemClass = ({ isActive }) =>
  `inline-flex w-max max-w-full
   whitespace-nowrap
   rounded-lg px-3 py-2 text-sm font-semibold transition
   ${
     isActive
       ? "bg-blue-400/20 text-white"
       : "text-slate-200 hover:bg-blue-400/10 hover:text-white"
   }`;

/* Mobile Join Us */
const mobileJoinClass = ({ isActive }) =>
  `inline-flex w-max
   whitespace-nowrap
   rounded-full px-4 py-2 text-sm font-semibold transition
   ${
     isActive
       ? "bg-sky-200 text-[#06162e] shadow"
       : "bg-blue-600 text-white hover:bg-blue-500 shadow"
   }`;

/* Mobile Admin */
const mobileAdminClass = ({ isActive }) =>
  `inline-flex w-max
   whitespace-nowrap
   rounded-full px-4 py-2 text-sm font-semibold transition
   ${
     isActive
       ? "bg-sky-300/25 text-white shadow-inner"
       : "bg-[#164c94] text-white hover:bg-blue-600 shadow"
   }`;

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  // ESC close: unchanged
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <header className="border-b border-blue-400/20 bg-[#020916]/95 shadow-[0_6px_24px_rgba(0,0,0,0.22),0_1px_16px_rgba(19,120,255,0.08)] backdrop-blur sticky top-0 z-50">
      <div className="w-full px-6 py-4 flex items-center justify-between relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="DIU Film & Photography Club"
            className="w-11 h-11 rounded-full border border-blue-400/35 bg-white object-contain shadow-[0_0_16px_rgba(19,120,255,0.20)]"
          />
          <div className="leading-tight">
            <div className="font-bold tracking-tight text-white text-lg">DIUFPC</div>
            <div className="text-sm text-slate-300">DIU Film & Photography Club</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/events" className={linkClass}>Events</NavLink>
          <NavLink to="/team" className={linkClass}>Team</NavLink>
          <NavLink to="/gallery" className={linkClass}>Gallery</NavLink>
          <NavLink to="/announcements" className={linkClass}>Announcements</NavLink>
          <NavLink to="/results" className={linkClass}>Results</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>

          <NavLink to="/joinus" className={joinClass}>Join Us</NavLink>
          {isAdmin && <NavLink to="/admin" className={adminClass}>Admin</NavLink>}
        </nav>

        {/* Mobile Dropdown */}
        <div className="md:hidden relative">
          <button
            className="px-3 py-1.5 rounded-full border border-blue-400/30 text-sm font-semibold text-white bg-blue-400/10 hover:bg-blue-400/20 transition"
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label="Open menu"
          >
            Menu ▾
          </button>

          {open && (
            <>
              {/* outside click overlay */}
              <button
                aria-label="Close menu overlay"
                className="fixed inset-0 z-[55] bg-black/30"
                onClick={() => setOpen(false)}
              />

              {/* Panel width = content width (no extra right space) */}
              <div className="absolute right-0 top-full mt-2 z-[60]">
                <div
                  className="
                    inline-block w-max max-w-[85vw]
                    max-h-[62vh] overflow-y-auto
                    rounded-2xl border border-blue-400/25
                    bg-[#06162e]/98 shadow-[0_18px_40px_rgba(0,0,0,0.38),0_0_25px_rgba(19,120,255,0.12)]
                    [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden
                  "
                >
                  <div className="p-1 flex flex-col items-start gap-1">
                    <NavLink to="/events" className={mobileItemClass} onClick={() => setOpen(false)}>Events</NavLink>
                    <NavLink to="/team" className={mobileItemClass} onClick={() => setOpen(false)}>Team</NavLink>
                    <NavLink to="/gallery" className={mobileItemClass} onClick={() => setOpen(false)}>Gallery</NavLink>
                    <NavLink to="/announcements" className={mobileItemClass} onClick={() => setOpen(false)}>Announcements</NavLink>
                    <NavLink to="/results" className={mobileItemClass} onClick={() => setOpen(false)}>Results</NavLink>
                    <NavLink to="/contact" className={mobileItemClass} onClick={() => setOpen(false)}>Contact</NavLink>

                    <div className="w-full h-px bg-blue-300/15 my-1" />

                    <NavLink to="/joinus" className={mobileJoinClass} onClick={() => setOpen(false)}>Join Us</NavLink>
                    {isAdmin && (
                      <NavLink to="/admin" className={mobileAdminClass} onClick={() => setOpen(false)}>Admin</NavLink>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
