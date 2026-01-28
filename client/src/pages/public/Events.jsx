 import { Link } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { useState } from "react";

import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

function CoverPhoto({ src, alt, badgeText, badgeTone = "open" }) {
  const [bad, setBad] = useState(false);
  const url = String(src || "").trim();

  if (!url || bad) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/60">
        <div className="aspect-[16/10] md:aspect-[16/9] flex items-center justify-center">
          <div className="text-slate-600 font-bold text-sm">No Cover Image</div>
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
            <span
              className={`text-xs px-4 py-2 rounded-full font-extrabold border ${badgeClass}`}
            >
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

export default function Events() {
  const { events, loadingEvents, eventsError } = useEvents();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="app-card p-7 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Events
        </h1>
        <div className="contact-underline mx-auto mt-3" />
        <p className="mt-3 text-slate-700">
          Explore upcoming and published club events and register easily.
        </p>
      </div>

      {eventsError && (
        <div className="mt-6 app-card p-5 text-red-700 font-bold">
          {eventsError}
        </div>
      )}

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="text-sm text-slate-700 font-semibold">
          {loadingEvents ? "Loading events..." : `${events.length} events found`}
        </div>

        <Link
          to="/joinus"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
        >
          Join Us
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(loadingEvents ? Array.from({ length: 4 }) : events).map((e, idx) => {
          if (loadingEvents) {
            return (
              <div key={idx} className="app-card p-6">
                <div className="w-full bg-slate-200 rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] md:aspect-[16/9]" />
                </div>
                <div className="mt-4 h-5 w-2/3 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            );
          }

          const status = String(e.status || "").toUpperCase();
          const badge =
            status === "PUBLISHED" ? "Published" : status === "DRAFT" ? "Draft" : status;

          const cover = (e.image || e.coverImage || "").trim();

          const deadlineStr = dateOnly(e.deadline);
          const startStr = dateOnly(e.startDate);

          const regClosed = deadlineStr ? isPast(deadlineStr, "end") : false;

          return (
            <div key={e.id || idx} className="app-card p-6 flex flex-col">
              <CoverPhoto
                src={cover}
                alt={e.title || "Event cover"}
                badgeText={deadlineStr ? (regClosed ? "Registration Closed" : "Registration Open") : ""}
                badgeTone={deadlineStr ? (regClosed ? "closed" : "open") : "open"}
              />

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {e.title}
                  </h3>
                  {e.subtitle ? (
                    <div className="text-sm text-slate-700 mt-1">
                      {e.subtitle}
                    </div>
                  ) : null}
                </div>

                <span className="text-xs px-3 py-1 rounded-full border font-bold text-slate-800 bg-white/50">
                  {badge}
                </span>
              </div>

              {e.shortDescription ? (
                <p className="mt-3 text-slate-700">{e.shortDescription}</p>
              ) : null}

              <div className="mt-4 text-sm text-slate-700 space-y-1">
                {deadlineStr ? (
                  <div>
                    <span className="font-bold">Deadline:</span> {deadlineStr}
                  </div>
                ) : null}

                {e.location ? (
                  <div>
                    <span className="font-bold">Location:</span> {e.location}
                  </div>
                ) : null}
              </div>

              {/* ✅ Countdown Area */}
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

              <div className="mt-5 flex gap-3 flex-wrap mt-auto">
                <Link
                  to={`/events/${e.slug}`}
                  className="px-4 py-2 rounded-xl border font-bold text-slate-900 hover:bg-white/60 transition"
                >
                  Details
                </Link>

                {regClosed ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-slate-300 text-slate-600 font-extrabold cursor-not-allowed"
                    title="Registration closed"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <Link
                    to={`/register/${e.slug}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                  >
                    Register
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
