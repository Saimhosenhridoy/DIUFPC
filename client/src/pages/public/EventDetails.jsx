 import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import { gsPublic } from "../../api/public.gs";

import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

function safeJsonArray(raw) {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function CoverPhoto({ src, alt, badgeText, badgeTone = "open" }) {
  const [bad, setBad] = useState(false);
  const url = String(src || "").trim();

  if (!url || bad) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/60">
        <div className="aspect-[16/10] md:aspect-[16/9] flex items-center justify-center">
          <div className="text-slate-600 font-bold">No Cover Image</div>
        </div>
      </div>
    );
  }

  const badgeClass =
    badgeTone === "closed"
      ? "bg-slate-900/90 text-white border-slate-900/40"
      : "bg-white/70 text-slate-900 border-slate-200";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200">
      <div className="relative aspect-[16/10] md:aspect-[16/9]">
        <img
          src={url}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setBad(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {badgeText ? (
          <div className="absolute top-3 left-3">
            <span className={`text-xs px-4 py-2 rounded-full font-extrabold border ${badgeClass}`}>
              {badgeText}
            </span>
          </div>
        ) : null}

        {badgeTone === "closed" ? (
          <div className="absolute inset-0 bg-black/15" />
        ) : null}
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { slug } = useParams();
  const { events, loadingEvents } = useEvents();

  const found = useMemo(() => events.find((e) => e.slug === slug), [events, slug]);

  const [event, setEvent] = useState(found || null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (found) {
      setEvent(found);
      return;
    }

    let mounted = true;
    async function load() {
      try {
        setErr("");
        setLoading(true);
        const data = await gsPublic.publicEventBySlug(slug);
        if (mounted) setEvent(data);
      } catch (e) {
        if (mounted) setErr(e.message || "Event not found");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [found, slug]);

  if (loadingEvents && !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="app-card p-6">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="app-card p-6">Loading event...</div>
      </div>
    );
  }

  if (err || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="app-card p-6">
          <h2 className="text-xl font-extrabold text-slate-900">Event not found</h2>
          <p className="mt-2 text-slate-700">
            {err || "The event you're looking for doesn't exist."}
          </p>
          <Link to="/events" className="inline-block mt-4 underline font-bold">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const cover = (event.image || event.coverImage || "").trim();

  const deadlineStr = dateOnly(event.deadline);
  const startStr = dateOnly(event.startDate);

  const regClosed = deadlineStr ? isPast(deadlineStr, "end") : false;

  const categories = safeJsonArray(event.categories);
  const rules = safeJsonArray(event.rules);
  const highlights = safeJsonArray(event.highlights);
  const gallery = safeJsonArray(event.gallery);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="app-card p-7">
        <CoverPhoto
          src={cover}
          alt={event.title || "Event cover"}
          badgeText={deadlineStr ? (regClosed ? "Registration Closed" : "Registration Open") : ""}
          badgeTone={deadlineStr ? (regClosed ? "closed" : "open") : "open"}
        />

        <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">{event.title}</h2>
            {event.subtitle ? (
              <p className="mt-2 text-slate-700 font-semibold">{event.subtitle}</p>
            ) : null}
          </div>

          {deadlineStr ? (
            <div className="text-sm text-slate-700">
              Deadline: <span className="font-extrabold">{deadlineStr}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 text-sm text-slate-700 space-y-1">
          {event.location ? (
            <div>
              <span className="font-bold">Location:</span> {event.location}
            </div>
          ) : null}
          {event.entryFee ? (
            <div>
              <span className="font-bold">Entry Fee:</span> {event.entryFee}
            </div>
          ) : null}
        </div>

        {/* ✅ Countdown Blocks */}
        <div className="mt-6 space-y-3">
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

        {event.shortDescription ? (
          <p className="mt-4 text-slate-700">{event.shortDescription}</p>
        ) : null}

        <div className="mt-6 flex gap-3 flex-wrap">
          {regClosed ? (
            <button
              disabled
              className="px-5 py-3 rounded-xl bg-slate-300 text-slate-600 font-extrabold cursor-not-allowed"
            >
              Registration Closed
            </button>
          ) : (
            <Link
              to={`/register/${event.slug}`}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition"
            >
              Register Now
            </Link>
          )}

          <Link
            to="/events"
            className="px-5 py-3 rounded-xl border font-extrabold text-slate-900 hover:bg-white/60 transition"
          >
            Back
          </Link>
        </div>
      </div>

      {event.fullDescription ? (
        <div className="app-card p-7">
          <div className="text-xl font-extrabold text-slate-900">About</div>
          <div className="contact-underline mt-2" />
          <p className="mt-4 text-slate-700 leading-relaxed whitespace-pre-line text-justify">
            {event.fullDescription}
          </p>
        </div>
      ) : null}

      {categories.length > 0 ? (
        <div className="app-card p-7">
          <div className="text-xl font-extrabold text-slate-900">Categories</div>
          <div className="contact-underline mt-2" />
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="text-xs px-3 py-1 rounded-full border font-bold text-slate-800 bg-white/60"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {rules.length > 0 ? (
        <div className="app-card p-7">
          <div className="text-xl font-extrabold text-slate-900">Rules</div>
          <div className="contact-underline mt-2" />
          <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
            {rules.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {highlights.length > 0 ? (
        <div className="app-card p-7">
          <div className="text-xl font-extrabold text-slate-900">Highlights</div>
          <div className="contact-underline mt-2" />
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {highlights.map((h, idx) => (
              <div key={idx} className="app-card p-4">
                <div className="text-slate-800 font-bold">{h}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {gallery.length > 0 ? (
        <div className="app-card p-7">
          <div className="text-xl font-extrabold text-slate-900">Gallery</div>
          <div className="contact-underline mt-2" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gallery.map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="relative aspect-[16/10]">
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
