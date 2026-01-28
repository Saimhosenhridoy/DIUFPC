 // src/pages/public/Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// ===== HERO SLIDER IMAGES =====
import hero1 from "../../assets/hero/hero_banner_1.jpg";
import hero2 from "../../assets/hero/hero_banner_2.jpg";
import hero3 from "../../assets/hero/hero_banner_3.jpg";
import hero4 from "../../assets/hero/hero_banner_4.jpg";

// ===== BOT & VC IMAGES =====
import botPic from "../../assets/bot.jpg";
import vcPic from "../../assets/vc.jpg";

// ✅ public API
import { gsPublic } from "../../api/public.gs";

// ✅ reusable countdown
import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

/* ================= MESSAGE CARD ================= */
function MessageCard({
  reverse = false,
  photo,
  name,
  designationLine1,
  designationLine2,
  title,
  body,
}) {
  return (
    <div className="app-card p-6 md:p-8 relative z-[1]">
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* IMAGE SIDE */}
        <div className={`lg:col-span-4 ${reverse ? "lg:order-2" : "lg:order-1"}`}>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={photo}
              alt={name}
              className="w-full h-[300px] md:h-[340px] object-cover"
            />

            {/* OVERLAY NAME + DESIGNATION */}
            <div className="absolute inset-x-0 bottom-0 p-3">
              <div className="bg-black/55 backdrop-blur rounded-xl px-4 py-3 text-center">
                <div className="text-base font-extrabold text-white leading-tight">
                  {name}
                </div>

                <div className="mt-1 rounded-full bg-white/90 px-4 py-1 text-slate-900 text-xs font-semibold leading-tight">
                  <div>{designationLine1}</div>
                  <div>{designationLine2}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEXT SIDE */}
        <div className={`lg:col-span-8 ${reverse ? "lg:order-1" : "lg:order-2"}`}>
          <div className="text-sm font-bold text-slate-700">{title}</div>

          <h3 className="mt-2 text-2xl md:text-3xl font-extrabold home-gradient-text">
            DIU Film & Photography Club
          </h3>

          <p className="mt-4 text-slate-700 leading-relaxed text-justify">{body}</p>
        </div>
      </div>
    </div>
  );
}

function pickUpcoming_(arr) {
  const toTime = (v) => {
    const s = String(v || "").trim();
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : 0;
  };

  const now = Date.now();

  // prefer deadline, else startDate, else date
  const enriched = (arr || []).map((e) => {
    const when = toTime(e.deadline) || toTime(e.startDate) || toTime(e.date);
    return { ...e, __when: when };
  });

  enriched.sort((a, b) => {
    const aUp = a.__when ? (a.__when >= now ? 1 : 0) : -1;
    const bUp = b.__when ? (b.__when >= now ? 1 : 0) : -1;
    if (aUp !== bUp) return bUp - aUp;
    return (b.__when || 0) - (a.__when || 0);
  });

  return enriched.slice(0, 4);
}

/* ================= HOME ================= */
export default function Home() {
  const slides = useMemo(() => [hero1, hero2, hero3, hero4], []);
  const [index, setIndex] = useState(0);
  const total = slides.length;

  // ✅ dynamic events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsErr, setEventsErr] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((v) => (v + 1) % total);
    }, 4500);
    return () => clearInterval(timer);
  }, [total]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setEventsErr("");
        setLoadingEvents(true);
        const data = await gsPublic.publicEvents();
        if (!alive) return;
        setEvents(pickUpcoming_(Array.isArray(data) ? data : []));
      } catch (e) {
        if (!alive) return;
        setEvents([]);
        setEventsErr(e?.message || "Failed to load events");
      } finally {
        if (!alive) return;
        setLoadingEvents(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="w-full relative">
      {/* ✅ Premium floating background */}
      <div className="home-floating-wrap">
        <div className="home-float bubble b1" />
        <div className="home-float bubble b2" />
        <div className="home-float bubble b3" />
        <div className="home-float bubble b4" />
        <div className="home-float camera" />
        <div className="home-float lens" />
        <div className="home-float aperture" />
      </div>

      {/* ================= HERO SLIDER ================= */}
      <section className="w-full pt-8 relative z-[1]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative app-card overflow-hidden">
            <div className="relative h-[360px] md:h-[520px]">
              <div
                className="absolute inset-0 flex transition-transform duration-700"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {slides.map((img, i) => (
                  <div key={i} className="min-w-full relative">
                    <img src={img} alt={`Hero ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
                  </div>
                ))}
              </div>

              {/* ✅ MINIMAL OVERLAY */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div className="max-w-3xl">
                  <h1 className="text-3xl md:text-6xl font-extrabold drop-shadow home-gradient-text">
                    Welcome to DIU Film &amp; Photography Club
                  </h1>

                  <div className="mt-3 text-lg md:text-2xl font-semibold text-white drop-shadow">
                    Showcase Your Vision
                  </div>

                  <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                    <Link
                      to="/about"
                      className="px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold hover:bg-white/90 transition"
                    >
                      About Us
                    </Link>

                    <Link
                      to="/team"
                      className="px-6 py-3 rounded-xl border border-white/90 text-white font-extrabold hover:bg-white/10 transition"
                    >
                      Team
                    </Link>

                    <Link
                      to="/joinus"
                      className="px-6 py-3 rounded-xl bg-slate-900/90 text-white font-extrabold hover:bg-slate-900 transition"
                    >
                      Join Us
                    </Link>
                  </div>
                </div>
              </div>

              {/* ARROWS */}
              <button
                onClick={() => setIndex((index - 1 + total) % total)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 px-3 py-2 rounded-full"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => setIndex((index + 1) % total)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 px-3 py-2 rounded-full"
                aria-label="Next"
              >
                ›
              </button>

              {/* DOTS */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index ? "w-7 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT + OUR IMPACT ================= */}
      <section className="w-full relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 app-card p-7">
              <div className="text-sm font-bold text-slate-700">About</div>
              <h2 className="mt-1 text-2xl md:text-3xl font-extrabold home-gradient-text">
                DIU Film & Photography Club
              </h2>
              <div className="contact-underline mt-2" />
              <p className="mt-4 text-slate-700 leading-relaxed text-justify">
                We are a creative community focused on photography, filmmaking, and visual storytelling.
                Through workshops, photo-walks, competitions, exhibitions, and collaborative productions,
                we help students build skills, confidence, and a strong artistic identity.
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <Link
                  to="/about"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition"
                >
                  Learn More →
                </Link>
                <Link
                  to="/gallery"
                  className="px-5 py-2.5 rounded-xl border border-slate-900/15 hover:bg-white/60 font-extrabold text-slate-900 transition"
                >
                  Visit Gallery
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 app-card p-7">
              <div className="text-sm font-bold text-slate-700">Our Impact</div>
              <h3 className="mt-1 text-xl md:text-2xl font-extrabold home-gradient-text">
                What We Do
              </h3>
              <div className="contact-underline mt-2" />

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { t: "Workshops", d: "Hands-on learning & mentoring" },
                  { t: "Photo Walks", d: "Real-world practice & teamwork" },
                  { t: "Competitions", d: "Challenge & recognition" },
                  { t: "Exhibitions", d: "Showcase student stories" },
                ].map((x) => (
                  <div key={x.t} className="app-card p-4">
                    <div className="font-extrabold text-slate-900">{x.t}</div>
                    <div className="text-sm text-slate-700 mt-1">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/events"
                  className="inline-block px-5 py-2.5 rounded-xl bg-white/70 hover:bg-white font-extrabold text-slate-900 transition border border-slate-900/10"
                >
                  Explore Events →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= UPCOMING EVENTS (MOBILE like screenshot) ================= */}
      <section className="w-full relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 pb-14">
          <div className="app-card p-7">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-slate-700">Latest Updates</div>
                <h2 className="mt-1 text-2xl md:text-3xl font-extrabold home-gradient-text">
                  Upcoming Events
                </h2>
                <div className="contact-underline mt-2" />
              </div>

              <Link
                to="/events"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition self-start md:self-auto"
              >
                View All Events →
              </Link>
            </div>

            {eventsErr && <div className="mt-5 text-red-700 font-bold">{eventsErr}</div>}

            {loadingEvents ? (
              <div className="mt-7 flex items-center justify-center gap-3">
                <div className="home-spinner" />
                <div className="font-extrabold text-slate-800">Loading events...</div>
              </div>
            ) : events.length === 0 ? (
              <div className="mt-6 text-slate-700 font-semibold">No published events yet.</div>
            ) : (
              <div className="mt-7 space-y-8">
                {events.map((e, idx) => {
                  const cover = (e.coverImage || e.image || "").trim();
                  const deadlineStr = dateOnly(e.deadline);
                  const startStr = dateOnly(e.startDate);
                  const venue = (e.location || "").trim();
                  const regClosed = deadlineStr ? isPast(deadlineStr, "end") : false;

                  const descText = (e.shortDescription || e.description || "").trim();

                  return (
                    <div
                      key={e.id || e.slug || idx}
                      className={`flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch ${
                        idx !== 0 ? "pt-8 border-t border-slate-900/10" : ""
                      }`}
                    >
                      {/* COVER (only) */}
                      <div className="w-full lg:w-[520px] shrink-0">
                        <div className="relative overflow-hidden rounded-3xl">
                          {cover ? (
                            <img
                              src={cover}
                              alt={e.title || "Event Cover"}
                              className={`w-full h-[230px] sm:h-[300px] lg:h-[320px] object-cover ${
                                regClosed ? "opacity-90" : ""
                              }`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-[230px] sm:h-[300px] lg:h-[320px] bg-white/40 flex items-center justify-center text-slate-700 font-bold">
                              No Cover Image
                            </div>
                          )}

                          {deadlineStr ? (
                            <div className="absolute top-3 left-3">
                              <span
                                className={`text-xs px-4 py-2 rounded-full font-extrabold border ${
                                  regClosed
                                    ? "bg-slate-900/90 text-white border-slate-900/40"
                                    : "bg-white/70 text-slate-900 border-slate-200"
                                }`}
                              >
                                {regClosed ? "Registration Closed" : "Registration Open"}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* ✅ Desktop only: desc under image */}
                        {descText ? (
                          <p className="hidden lg:block mt-3 text-sm leading-relaxed text-slate-700 text-justify line-clamp-4">
                            {descText}
                          </p>
                        ) : null}
                      </div>

                      {/* TEXT (mobile shows desc here like screenshot) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                              {e.title || "Untitled Event"}
                            </div>

                            {e.subtitle ? (
                              <div className="mt-1 text-slate-700 font-medium">{e.subtitle}</div>
                            ) : null}
                          </div>

                          <span className="shrink-0 text-xs px-4 py-2 rounded-full border font-bold text-slate-800 bg-white/40">
                            {String(e.status || "PUBLISHED").toUpperCase()}
                          </span>
                        </div>

                        {/* ✅ Mobile only: desc under title (like screenshot) */}
                        {descText ? (
                          <p className="mt-4 text-slate-700 leading-relaxed text-justify lg:hidden">
                            {descText}
                          </p>
                        ) : null}

                        {/* DEADLINE + VENUE */}
                        <div className="mt-4 text-base text-slate-700 space-y-1">
                          {deadlineStr ? (
                            <div>
                              <span className="font-extrabold">Deadline:</span>{" "}
                              <span className="font-normal">{deadlineStr}</span>
                            </div>
                          ) : null}

                          {venue ? (
                            <div>
                              <span className="font-extrabold">Location:</span>{" "}
                              <span className="font-normal">{venue}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* ✅ COUNTDOWNS: keep old look (4 boxes in one row) */}
                        <div className="mt-4 space-y-3">
                          {deadlineStr ? (
                            <Countdown
                              target={deadlineStr}
                              mode="end"
                              title="Registration Countdown"
                              doneText="CLOSED"
                              activeText="OPEN"
                              theme="blue"
                            />
                          ) : null}

                          {startStr ? (
                            <Countdown
                              target={startStr}
                              mode="start"
                              title="Event Starts In"
                              doneText="STARTED"
                              activeText="UPCOMING"
                              theme="blue"
                            />
                          ) : null}
                        </div>

                        <div className="mt-6 flex gap-3 flex-wrap">
                          <Link
                            to={`/events/${e.slug}`}
                            className="px-6 py-3 rounded-2xl border border-slate-900/15 hover:bg-white/60 font-extrabold text-slate-900 transition"
                          >
                            Details
                          </Link>

                          {regClosed ? (
                            <button
                              disabled
                              className="px-6 py-3 rounded-2xl bg-slate-300 text-slate-600 font-extrabold cursor-not-allowed"
                              title="Registration closed"
                            >
                              Registration Closed
                            </button>
                          ) : (
                            <Link
                              to={`/register/${e.slug}`}
                              className="px-6 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-extrabold transition"
                            >
                              Register
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= BOT & VC ================= */}
      <section className="w-full relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 pb-14 space-y-12">
          <MessageCard
            photo={botPic}
            name="Barrister Shameem Haider Patwary"
            designationLine1="Chairman, BOT"
            designationLine2="Dhaka International University (DIU)"
            title="Message from the Chairman"
            body={`The DIU Film & Photography Club is a creative platform dedicated to nurturing visual storytelling, cinematic thinking, and artistic excellence among students. Our club brings together passionate individuals who are eager to explore film, photography, and digital media as tools for expression, documentation, and social reflection. Through hands-on workshops, exhibitions, screenings, and collaborative projects, we strive to develop both technical skills and creative vision. We believe this club will empower students to tell meaningful stories, preserve moments of cultural significance, and represent DIU through powerful visual narratives.`}
          />

          <MessageCard
            reverse
            photo={vcPic}
            name="Professor Dr. Zahidul Islam"
            designationLine1="Vice-Chancellor"
            designationLine2="Dhaka International University (DIU)"
            title="Message from the Vice Chancellor"
            body={`The DIU Film & Photography Club represents a dynamic initiative that promotes creativity, innovation, and critical observation within the academic environment. By engaging students in film and photography, the club encourages them to view society, culture, and human experiences through thoughtful and artistic lenses. This initiative not only enhances creative competence but also builds leadership, teamwork, and ethical responsibility. I strongly support the activities of the DIU Film & Photography Club and believe it will play an important role in enriching student life and strengthening the creative identity of Dhaka International University.`}
          />
        </div>
      </section>
    </div>
  );
}
