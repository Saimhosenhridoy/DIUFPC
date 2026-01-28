 // src/pages/public/About.jsx
import { Link } from "react-router-dom";
import {
  Sparkles,
  Target,
  Eye,
  Camera,
  Film,
  MapPin,
  Trophy,
  Users,
  GraduationCap,
  GalleryHorizontal,
  Megaphone,
  CheckCircle2,
  Facebook,
  ArrowRight,
  Mail,
  LayoutGrid,
} from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/diufpc/";
const EMAIL = "diufpc@gmail.com";

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="app-card p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-200/60 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[#112240] font-extrabold">{title}</div>
          <div className="text-slate-700 text-sm mt-1 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniItem({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-blue-200/70 bg-white/55 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-200/60 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-700" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[#112240]">{title}</div>
          <div className="text-slate-700 text-sm mt-1 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ✅ Quick Links button (theme matched) */
function QuickLink({ to, icon: Icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="
        group rounded-2xl border border-blue-200/70 bg-white/55 p-4
        hover:bg-blue-50/70 hover:border-blue-300 transition
        flex items-start gap-3
      "
    >
      <div className="shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-200/60 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-700" />
      </div>
      <div className="min-w-0">
        <div className="font-extrabold text-[#112240] group-hover:text-blue-800">
          {title}
        </div>
        <div className="text-slate-600 text-sm mt-0.5 leading-snug">
          {subtitle}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-blue-700 ml-auto mt-1 opacity-70 group-hover:opacity-100 transition" />
    </Link>
  );
}

export default function About() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ===== Hero ===== */}
        <div className="app-card p-7 text-center">
          <div className="inline-flex items-center gap-2 justify-center text-blue-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            About DIUFPC
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112240] mt-2">
            DIU Film & Photography Club
          </h1>

          <div className="contact-underline mx-auto mt-3" />

          {/* ✅ justify */}
          <p className="text-slate-700 text-sm sm:text-base mt-4 max-w-3xl mx-auto leading-relaxed text-justify">
            DIUFPC (Dhaka International University Film & Photography Club) is a
            creative community for DIU students who love filmmaking and
            photography. We bring together storytellers, creators, and visual
            artists to learn, practice, and showcase their work.
          </p>

          {/* CTA */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/joinus"
              className="px-5 py-2.5 rounded-full bg-blue-500/90 text-white font-bold hover:bg-blue-500 transition inline-flex items-center gap-2"
            >
              Join Us <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-full border border-blue-200 bg-white/70 text-[#112240] font-bold hover:bg-blue-50 transition inline-flex items-center gap-2"
            >
              <Facebook className="w-4 h-4 text-blue-700" />
              Facebook
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="px-5 py-2.5 rounded-full border border-blue-200 bg-white/70 text-[#112240] font-bold hover:bg-blue-50 transition inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-blue-700" />
              Email
            </a>
          </div>
        </div>

        {/* ===== Mission / Vision (1 line) ===== */}
        <div className="grid md:grid-cols-2 gap-5">
          <InfoCard icon={Target} title="Mission">
            Empower DIU students to create, learn, and express through film and
            photography.
          </InfoCard>

          <InfoCard icon={Eye} title="Vision">
            Build a vibrant visual storytelling culture at DIU.
          </InfoCard>
        </div>

        {/* ===== What We Do ===== */}
        <div className="app-card p-6">
          <div className="flex items-center gap-2 justify-center text-blue-700 font-bold text-sm">
            <Megaphone className="w-4 h-4" />
            What We Do
          </div>
          <h2 className="text-2xl font-extrabold text-[#112240] text-center mt-2">
            Activities of DIUFPC
          </h2>
          <div className="contact-underline mx-auto mt-3" />

          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <MiniItem
              icon={GraduationCap}
              title="Workshops & Masterclasses"
              desc="Learn camera basics, composition, lighting, editing & storytelling through hands-on sessions."
            />
            <MiniItem
              icon={MapPin}
              title="Photowalks"
              desc="Real-life practice to capture moments, street stories, and campus life with guidance."
            />
            <MiniItem
              icon={Film}
              title="Film Screenings"
              desc="Watch, learn, and discuss films to understand narrative, framing, and direction."
            />
            <MiniItem
              icon={GalleryHorizontal}
              title="Exhibitions & Showcases"
              desc="Present student works in exhibitions and themed showcases (e.g., Shutter Stories, Visual Poetry)."
            />
            <MiniItem
              icon={Trophy}
              title="Competitions & Submissions"
              desc="Creative challenges that improve skills and help members build a strong portfolio."
            />
            <MiniItem
              icon={Users}
              title="University Collaborations"
              desc="Creative support and coverage for DIU programs, events, and cultural activities."
            />
          </div>
        </div>

        {/* ===== Why Join ===== */}
        <div className="app-card p-6">
          <div className="flex items-center gap-2 justify-center text-blue-700 font-bold text-sm">
            <Camera className="w-4 h-4" />
            Why Join DIUFPC
          </div>
          <h2 className="text-2xl font-extrabold text-[#112240] text-center mt-2">
            Benefits for Members
          </h2>
          <div className="contact-underline mx-auto mt-3" />

          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {[
              "Learn by doing with real projects and teamwork",
              "Build a strong portfolio and creative confidence",
              "Get opportunities for exhibition & showcasing",
              "Improve editing, composition, lighting & storytelling",
              "Grow your network with like-minded creators",
              "Develop leadership through club responsibilities",
            ].map((t) => (
              <div
                key={t}
                className="rounded-2xl border border-blue-200/70 bg-white/55 p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                <div className="text-slate-800 text-sm font-semibold leading-relaxed">
                  {t}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Contact & Social ONLY (and delete below part completely) */}
        <div className="app-card p-6">
          <h3 className="text-xl font-extrabold text-[#112240] text-center">
            Contact & Social
          </h3>
          <div className="contact-underline mx-auto mt-3" />

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-blue-200/70 bg-white/55 p-4 flex items-start gap-3">
              <Facebook className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[#112240]">Facebook Page</div>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-700 hover:underline break-all"
                >
                  {FACEBOOK_URL}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200/70 bg-white/55 p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[#112240]">Email</div>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm text-slate-700 hover:underline break-all"
                >
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Quick Links card = sobar nice (last) */}
        <div className="app-card p-6">
          <div className="flex items-center gap-2 justify-center text-blue-700 font-bold text-sm">
            <LayoutGrid className="w-4 h-4" />
            Quick Links
          </div>
          <h2 className="text-2xl font-extrabold text-[#112240] text-center mt-2">
            Explore DIUFPC
          </h2>
          <div className="contact-underline mx-auto mt-3" />

          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickLink
              to="/events"
              icon={MapPin}
              title="Events"
              subtitle="Upcoming events, schedules & registrations"
            />
            <QuickLink
              to="/gallery"
              icon={GalleryHorizontal}
              title="Gallery"
              subtitle="Our moments, workshops, photowalks & exhibitions"
            />
            <QuickLink
              to="/team"
              icon={Users}
              title="Team"
              subtitle="Meet our committee and contributors"
            />
            <QuickLink
              to="/contact"
              icon={Mail}
              title="Contact"
              subtitle="Get in touch with DIUFPC"
            />
            <QuickLink
              to="/joinus"
              icon={Camera}
              title="Join Us"
              subtitle="Become a member and start creating"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
