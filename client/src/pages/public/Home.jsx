 // src/pages/public/Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// ===== HERO SLIDER IMAGES =====
import hero1 from "../../assets/hero/hero_banner_1.jpeg";
import hero2 from "../../assets/hero/hero_banner_2.jpeg";
import hero3 from "../../assets/hero/hero_banner_3.jpeg";
import hero4 from "../../assets/hero/hero_banner_4.jpeg";
import hero5 from "../../assets/hero/hero_banner_5.jpeg";
import hero6 from "../../assets/hero/hero_banner_6.jpeg";
import hero7 from "../../assets/hero/hero_banner_7.jpeg";
import hero8 from "../../assets/hero/hero_banner_8.jpeg";
import hero9 from "../../assets/hero/hero_banner_9.jpeg";

// ===== BOT & VC IMAGES =====
import botPic from "../../assets/bot.jpeg";
import vcPic from "../../assets/vc.jpeg";

// Decorative PNG assets only. These do not affect website functionality.
import photographerWatermark from "../../assets/watermarks/01_photographer_silhouette.png";
import filmStripWatermark from "../../assets/watermarks/02_film_strip_top.png";
import cameraLensWatermark from "../../assets/watermarks/04_camera_lens.png";

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
    <div className="app-card p-6 md:p-8 relative z-[1] overflow-hidden">
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

                <div className="mt-1 rounded-full bg-[#102b4f]/90 px-4 py-1 text-blue-100 text-xs font-semibold leading-tight">
                  <div>{designationLine1}</div>
                  <div>{designationLine2}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEXT SIDE */}
        <div className={`lg:col-span-8 ${reverse ? "lg:order-1" : "lg:order-2"}`}>
          <div className="text-sm font-bold text-slate-300">{title}</div>

          <h3 className="mt-2 text-2xl md:text-3xl font-extrabold home-gradient-text">
            DIU Film & Photography Club
          </h3>

          <p lang="en" className="mt-4 text-slate-300 leading-relaxed text-justify [text-align-last:left] [hyphens:auto] [overflow-wrap:break-word] [word-break:normal]">{body}</p>
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
  const slides = useMemo(() => [hero1,  hero7,hero5, hero6, hero8, hero9, hero2], []);
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
    <div className="diufpc-cinematic-home w-full relative text-slate-100">
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

      {/* ================= CINEMATIC FULL-WIDTH HERO SLIDER ================= */}
      <section className="relative z-[1] w-full overflow-hidden" aria-label="DIUFPC cinematic hero">
        <div
          className="relative isolate h-[390px] sm:h-[440px] md:h-[490px] lg:h-[520px] w-full overflow-hidden bg-[#020711] outline-none"
          role="region"
          tabIndex={0}
          aria-label="Hero slideshow. Click the left half for previous slide, right half for next slide, or use arrow keys."
          onClick={(e) => {
            // CTA buttons, navigation links, and slide dots remain independent.
            if (e.target.closest("a, button")) return;
            const bounds = e.currentTarget.getBoundingClientRect();
            const goForward = e.clientX - bounds.left >= bounds.width / 2;
            setIndex((v) => goForward ? (v + 1) % total : (v - 1 + total) % total);
          }}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            setIndex((v) => e.key === "ArrowRight" ? (v + 1) % total : (v - 1 + total) % total);
          }}
        >
          {/* Photo layer: grayscale only. Blue lighting is an independent CSS overlay. */}
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-hidden="true"
          >
            {slides.map((img, i) => (
              <div key={i} className="relative h-full w-full min-w-full overflow-hidden">
                <img
                  src={img}
                  alt=""
                  draggable="false"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{ filter: "grayscale(100%) contrast(1.13) brightness(.82)" }}
                />
              </div>
            ))}
          </div>

          {/* Photo-safe overlays: black gradient + subtle electric-blue light */}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#01050e]/95 via-[#020915]/75 to-[#020814]/20" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#020711]/85 via-transparent to-[#01050c]/45" />
          <div className="pointer-events-none absolute -left-28 bottom-[-160px] z-[1] h-[370px] w-[390px] rounded-full bg-[#006dff]/35 blur-[92px]" />
          <div className="pointer-events-none absolute -right-24 bottom-[-110px] z-[1] h-[300px] w-[420px] rounded-full bg-[#006bff]/25 blur-[90px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent shadow-[0_0_22px_4px_rgba(22,112,255,0.6)]" />

          {/* Content stays LEFT aligned, as in reference image. */}
          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
              <div className="pointer-events-auto max-w-[620px] pt-4 sm:pt-0">
                <p className="mb-4 text-[10px] sm:text-xs font-extrabold uppercase tracking-[.35em] text-[#73b5ff] drop-shadow-[0_0_12px_rgba(35,120,255,.9)]">
                  DIU Film &amp; Photography Club
                </p>
                <p className="mb-1 text-lg sm:text-xl md:text-2xl font-light uppercase tracking-[.18em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.85)]">
                  Welcome to
                </p>
                <h1 className="font-black uppercase leading-[.96] tracking-[-.035em] text-[clamp(2.15rem,5.2vw,4.7rem)] drop-shadow-[0_4px_14px_rgba(0,0,0,.75)]">
                  <span className="block text-white">DIU Film &amp;</span>
                  <span className="block text-[#1b82ff] drop-shadow-[0_0_19px_rgba(13,105,255,.65)]">Photography</span>
                  <span className="flex items-center gap-5 text-white">Club <span className="mt-2 h-[3px] w-14 sm:w-20 rounded-full bg-[#1886ff] shadow-[0_0_14px_3px_rgba(20,124,255,.8)]" /></span>
                </h1>
                <p className="mt-5 sm:mt-7 text-xs sm:text-sm md:text-base font-medium text-slate-200 drop-shadow-[0_2px_7px_#000]">
                  Frame Stories <span className="px-1 text-blue-400">|</span> Create Change <span className="px-1 text-blue-400">|</span> Build Together
                </p>
                <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                  <Link to="/about" className="rounded-xl bg-[#086dff] px-5 sm:px-7 py-3 text-sm font-extrabold text-white shadow-[0_0_22px_rgba(0,102,255,.48)] transition hover:bg-[#2187ff] hover:shadow-[0_0_30px_rgba(0,102,255,.7)]">About Us →</Link>
                  <Link to="/team" className="rounded-xl border border-[#72b6ff]/40 bg-[#031021]/80 px-5 sm:px-7 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition hover:border-blue-400 hover:bg-[#102c53]">Our Team</Link>
                  <Link to="/joinus" className="rounded-xl border border-[#72b6ff]/40 bg-[#031021]/80 px-5 sm:px-7 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition hover:border-blue-400 hover:bg-[#102c53]">Join Us →</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination: active slide is a glowing electric-blue line. */}
          <div className="absolute bottom-5 inset-x-0 z-[3] flex justify-center gap-2.5" aria-label="Slideshow pagination">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={index === i ? "true" : undefined}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-10 bg-[#1686ff] shadow-[0_0_11px_3px_rgba(16,122,255,.8)]"
                    : "w-[7px] bg-slate-400/70 hover:bg-blue-200"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT + OUR IMPACT ================= */}
      <section className="w-full relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 app-card p-7 relative overflow-hidden">
              <img src={photographerWatermark} alt="" aria-hidden="true" draggable="false"
                className="pointer-events-none select-none absolute right-[-25px] bottom-[-25px] w-48 md:w-64 max-w-none object-contain opacity-[0.30]"
                style={{ filter: "brightness(1.15) contrast(1.12) drop-shadow(0 0 32px rgba(23,119,255,.8))" }} />
              <div className="text-sm font-bold text-slate-300">About</div>
              <h2 className="mt-1 text-2xl md:text-3xl font-extrabold home-gradient-text">
                DIU Film & Photography Club
              </h2>
              <div className="contact-underline mt-2" />
              <p lang="en" className="mt-4 text-slate-300 leading-relaxed text-justify [text-align-last:left] [hyphens:auto] [overflow-wrap:break-word] [word-break:normal]">
                We are a creative community focused on photography, filmmaking, and visual storytelling.
                Through workshops, photo-walks, competitions, exhibitions, and collaborative productions,
                we help students build skills, confidence, and a strong artistic identity.
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <Link
                  to="/about"
                  className="px-5 py-2.5 rounded-xl bg-[#0c3668] text-white font-extrabold hover:bg-[#174b87] transition"
                >
                  Learn More →
                </Link>
                <Link
                  to="/gallery"
                  className="px-5 py-2.5 rounded-xl border border-blue-400/30 hover:bg-[#1a3c69]/75 font-extrabold text-slate-50 transition"
                >
                  Visit Gallery
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 app-card p-7 relative overflow-hidden">
              <img src={cameraLensWatermark} alt="" aria-hidden="true" draggable="false"
                className="pointer-events-none select-none absolute right-[-50px] top-[-55px] w-48 md:w-56 max-w-none object-contain opacity-[0.30] brightness-125 drop-shadow-[0_0_24px_rgba(25,115,255,.7)]" />
              <div className="text-sm font-bold text-slate-300">Our Impact</div>
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
                    <div className="font-extrabold text-slate-50">{x.t}</div>
                    <div className="text-sm text-slate-300 mt-1">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/events"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#102b4f]/80 hover:bg-[#17549d] font-extrabold text-slate-50 transition border border-blue-400/20"
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
          <div className="app-card p-7 relative overflow-hidden">
            <img src={filmStripWatermark} alt="" aria-hidden="true" draggable="false"
              className="pointer-events-none select-none absolute right-[-30px] top-[-25px] w-56 md:w-80 max-w-none object-contain opacity-[0.26] brightness-125 drop-shadow-[0_0_24px_rgba(25,115,255,.65)]" />
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-slate-300">Latest Updates</div>
                <h2 className="mt-1 text-2xl md:text-3xl font-extrabold home-gradient-text">
                  Upcoming Events
                </h2>
                <div className="contact-underline mt-2" />
              </div>

              <Link
                to="/events"
                className="px-4 py-2 rounded-xl bg-[#0c3668] text-white font-bold hover:bg-[#174b87] transition self-start md:self-auto"
              >
                View All Events →
              </Link>
            </div>

            {eventsErr && <div className="mt-5 text-red-300 font-bold">{eventsErr}</div>}

            {loadingEvents ? (
              <div className="mt-7 flex items-center justify-center gap-3">
                <div className="home-spinner" />
                <div className="font-extrabold text-slate-200">Loading events...</div>
              </div>
            ) : events.length === 0 ? (
              <div className="mt-6 text-slate-300 font-semibold">No published events yet.</div>
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
                        idx !== 0 ? "pt-8 border-t border-blue-400/20" : ""
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
                            <div className="w-full h-[230px] sm:h-[300px] lg:h-[320px] bg-[#0a2345]/65 flex items-center justify-center text-slate-300 font-bold">
                              No Cover Image
                            </div>
                          )}

                          {deadlineStr ? (
                            <div className="absolute top-3 left-3">
                              <span
                                className={`text-xs px-4 py-2 rounded-full font-extrabold border ${
                                  regClosed
                                    ? "bg-[#09254a]/90 text-white border-blue-400/35"
                                    : "bg-[#102b4f]/80 text-slate-50 border-blue-400/30"
                                }`}
                              >
                                {regClosed ? "Registration Closed" : "Registration Open"}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* ✅ Desktop only: desc under image */}
                        {descText ? (
                          <p lang="en" className="hidden lg:block mt-3 text-sm leading-relaxed text-slate-300 text-justify [text-align-last:left] [hyphens:auto] [overflow-wrap:break-word] [word-break:normal] line-clamp-4">
                            {descText}
                          </p>
                        ) : null}
                      </div>

                      {/* TEXT (mobile shows desc here like screenshot) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-50 leading-tight">
                              {e.title || "Untitled Event"}
                            </div>

                            {e.subtitle ? (
                              <div className="mt-1 text-slate-300 font-medium">{e.subtitle}</div>
                            ) : null}
                          </div>

                          <span className="shrink-0 text-xs px-4 py-2 rounded-full border font-bold text-slate-200 bg-[#0a2345]/65">
                            {String(e.status || "PUBLISHED").toUpperCase()}
                          </span>
                        </div>

                        {/* ✅ Mobile only: desc under title (like screenshot) */}
                        {descText ? (
                          <p lang="en" className="mt-4 text-slate-300 leading-relaxed text-justify [text-align-last:left] [hyphens:auto] [overflow-wrap:break-word] [word-break:normal] lg:hidden">
                            {descText}
                          </p>
                        ) : null}

                        {/* DEADLINE + VENUE */}
                        <div className="mt-4 text-base text-slate-300 space-y-1">
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
                            className="px-6 py-3 rounded-2xl border border-blue-400/30 hover:bg-[#1a3c69]/75 font-extrabold text-slate-50 transition"
                          >
                            Details
                          </Link>

                          {regClosed ? (
                            <button
                              disabled
                              className="px-6 py-3 rounded-2xl bg-[#20324c] text-slate-400 font-extrabold cursor-not-allowed"
                              title="Registration closed"
                            >
                              Registration Closed
                            </button>
                          ) : (
                            <Link
                              to={`/register/${e.slug}`}
                              className="px-6 py-3 rounded-2xl bg-[#0c3668] text-white hover:bg-[#174b87] font-extrabold transition"
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
            body={`Dhaka International University Film & Photography Club (DIUFPC) has emerged as one of our most active and successful student organizations. Over the past years, they have organized several significant exhibitions that have greatly enriched our campus culture and student engagement.The club's achievements extend far beyond our campus. They have covered over five national exhibitions and numerous international events with professional precision. Their consistent success in national competitions, securing top-tier positions (1st, 2nd, and 3rd), and winning prestigious National Awards reflects their hard work and excellence.I commend DIUFPC for their professional approach in documenting every steps of the  university  and for their vision to establish photography and cinematography as viable professional careers for our students. Their progress over the last years is truly remarkable. `}
          />
        </div>
      </section>
    </div>
  );
}
