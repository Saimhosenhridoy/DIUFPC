// src/components/layout/Footer.jsx
import { Facebook, Instagram, Linkedin } from "lucide-react";
import photographerWatermark from "../../assets/watermarks/01_photographer_silhouette.png";
import filmStripWatermark from "../../assets/watermarks/02_film_strip_top.png";

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-blue-400/20 bg-[#020916]/95 backdrop-blur">
      {/* Visual-only watermarks: never intercept links or clicks. */}
      <img
        src={photographerWatermark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -left-8 bottom-0 z-0 h-44 w-44 md:h-64 md:w-64 object-contain opacity-[0.34] brightness-125 contrast-125 drop-shadow-[0_0_22px_rgba(25,120,255,0.58)]"
      />
      <img
        src={filmStripWatermark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-12 top-0 z-0 h-36 w-64 md:h-52 md:w-96 object-contain opacity-[0.30] brightness-125 contrast-125 drop-shadow-[0_0_20px_rgba(25,120,255,0.55)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(19,120,255,0.13),transparent_65%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="text-center space-y-4">
          {/* Copyright */}
          <div className="text-sm text-slate-300">
            © {new Date().getFullYear()} DIU FILM & Photography Club
          </div>

          {/* Developers: links and text retained verbatim. */}
          <div className="text-sm text-slate-400">
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/saim-hosen-hridoy/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-300 hover:text-sky-100 underline-offset-4 hover:underline transition"
            >
              Abu Saim Hossen Hridoy
            </a>{" "}
            &{" "}
            <a
              href="https://www.linkedin.com/in/nazmus-sakib-shohan/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-300 hover:text-sky-100 underline-offset-4 hover:underline transition"
            >
              Nazmus Sakib Shohan
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <a
              href="https://www.facebook.com/diufpc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-sky-300 transition"
            >
              <Facebook size={22} />
            </a>

            <a
              href="https://www.instagram.com/diufpc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-sky-300 transition"
            >
              <Instagram size={22} />
            </a>

            <a
              href="https://www.linkedin.com/company/99019382/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-sky-300 transition"
            >
              <Linkedin size={22} />
            </a>
          </div>

          {/* Tagline */}
          <div className="text-xs text-slate-500 pt-2">
            Official Website • DIU FILM & Photography Club
          </div>
        </div>
      </div>
    </footer>
  );
}
