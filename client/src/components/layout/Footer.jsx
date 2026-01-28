 import { Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#112240]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center space-y-4">
          {/* Copyright */}
          <div className="text-sm text-slate-300">
            © {new Date().getFullYear()} DIU FILM & Photography Club
          </div>

          {/* Developers */}
          <div className="text-sm text-slate-400">
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/saim-hosen-hridoy/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-300 hover:text-blue-200 underline-offset-4 hover:underline transition"
            >
              Abu Saim Hossen Hridoy
            </a>{" "}
            &{" "}
            <a
              href="https://www.linkedin.com/in/nazmus-sakib-shohan/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-300 hover:text-blue-200 underline-offset-4 hover:underline transition"
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
              className="text-slate-300 hover:text-blue-300 transition"
            >
              <Facebook size={22} />
            </a>

            <a
              href="https://www.instagram.com/diufpc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-pink-300 transition"
            >
              <Instagram size={22} />
            </a>

            <a
              href="https://www.linkedin.com/company/99019382/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-blue-400 transition"
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
