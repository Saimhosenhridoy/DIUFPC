 import { Link } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { useEffect, useMemo, useState } from "react";

import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

function CoverPhoto({ src, alt, badgeText, badgeTone = "open" }) {
  const [bad, setBad] = useState(false);
  const url = String(src || "").trim();

  if (!url || bad) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-blue-400/25 bg-[#102746]/85">
        <div className="aspect-[16/10] md:aspect-[16/9] flex items-center justify-center">
          <div className="text-slate-300 font-bold text-sm">No Cover Image</div>
        </div>
      </div>
    );
  }

  const badgeClass =
    badgeTone === "closed"
      ? "bg-[#07152D]/95 text-white border-blue-400/30"
      : "bg-[#102746]/85 text-slate-50 border-blue-400/25";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-blue-400/25">
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

  // Gallery albums use the same API and data shape as Gallery.jsx.
  // This does not change the published/registration events above.
  const [albumNames, setAlbumNames] = useState([]);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState("");

  useEffect(() => {
    let alive = true;
    const apiUrl = import.meta.env.VITE_GALLERY_API_URL;

    async function loadAlbums() {
      if (!apiUrl) {
        if (alive) {
          setAlbumsError("Photo albums are unavailable: gallery API is not configured.");
          setAlbumsLoading(false);
        }
        return;
      }

      try {
        setAlbumsLoading(true);
        setAlbumsError("");
        const [eventsResponse, photosResponse] = await Promise.all([
          fetch(`${apiUrl}?action=getEvents`),
          fetch(`${apiUrl}?action=getGallery`),
        ]);
        if (!eventsResponse.ok || !photosResponse.ok) {
          throw new Error("Unable to load gallery albums.");
        }
        const [eventsJson, photosJson] = await Promise.all([
          eventsResponse.json(),
          photosResponse.json(),
        ]);
        if (eventsJson?.status !== "success" || photosJson?.status !== "success") {
          throw new Error("Unable to load gallery albums.");
        }
        if (!alive) return;
        setAlbumNames((Array.isArray(eventsJson.data) ? eventsJson.data : [])
          .map((item) => String(item?.name || "").trim())
          .filter(Boolean));
        setAlbumPhotos(Array.isArray(photosJson.data) ? photosJson.data : []);
      } catch (error) {
        if (alive) setAlbumsError(error?.message || "Unable to load gallery albums.");
      } finally {
        if (alive) setAlbumsLoading(false);
      }
    }

    loadAlbums();
    return () => { alive = false; };
  }, []);

  const albums = useMemo(() => {
    const byName = new Map();
    for (const name of albumNames) {
      if (!byName.has(name)) byName.set(name, { name, count: 0, cover: "" });
    }
    for (const photo of albumPhotos) {
      const name = String(photo?.event || "").trim();
      if (!name) continue;
      if (!byName.has(name)) byName.set(name, { name, count: 0, cover: "" });
      const album = byName.get(name);
      album.count += 1;
      const imageUrl = String(photo?.imageUrl || "").trim();
      if (!album.cover && imageUrl) album.cover = imageUrl;
    }
    return [...byName.values()];
  }, [albumNames, albumPhotos]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="app-card p-7 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-50">
          Events
        </h1>
        <div className="contact-underline mx-auto mt-3" />
        <p className="mt-3 text-slate-300">
          Explore upcoming and published club events and register easily.
        </p>
      </div>

      {eventsError && (
        <div className="mt-6 app-card p-5 text-red-300 font-bold">
          {eventsError}
        </div>
      )}

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="text-sm text-slate-300 font-semibold">
          {loadingEvents ? "Loading events..." : `${events.length} events found`}
        </div>

        <Link
          to="/joinus"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
        >
          Join Us
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(loadingEvents ? Array.from({ length: 4 }) : events).map((e, idx) => {
          if (loadingEvents) {
            return (
              <div key={idx} className="app-card p-6">
                <div className="w-full bg-blue-900/50 rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] md:aspect-[16/9]" />
                </div>
                <div className="mt-4 h-5 w-2/3 bg-blue-900/50 rounded mb-3" />
                <div className="h-4 w-full bg-blue-900/50 rounded mb-2" />
                <div className="h-4 w-3/4 bg-blue-900/50 rounded" />
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
                  <h3 className="text-xl font-extrabold text-slate-50">
                    {e.title}
                  </h3>
                  {e.subtitle ? (
                    <div className="text-sm text-slate-300 mt-1">
                      {e.subtitle}
                    </div>
                  ) : null}
                </div>

                <span className="text-xs px-3 py-1 rounded-full border font-bold text-blue-100 bg-[#102746]/85">
                  {badge}
                </span>
              </div>

              {e.shortDescription ? (
                <p className="mt-3 text-slate-300">{e.shortDescription}</p>
              ) : null}

              <div className="mt-4 text-sm text-slate-300 space-y-1">
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
                  className="px-4 py-2 rounded-xl border font-bold text-slate-50 hover:bg-blue-800/30 transition"
                >
                  Details
                </Link>

                {regClosed ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 font-extrabold cursor-not-allowed"
                    title="Registration closed"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <Link
                    to={`/register/${e.slug}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                  >
                    Register
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gallery photo albums — separate from registration events */}
      <section className="mt-12" aria-labelledby="photo-albums-title">
        <div className="app-card p-7 text-center">
          <h2 id="photo-albums-title" className="text-2xl md:text-3xl font-extrabold home-gradient-text">
            Past Events &amp; Photo Albums
          </h2>
          <div className="contact-underline mx-auto mt-3" />
          <p className="mt-3 text-slate-300">
            Explore moments from our club events, photowalks and exhibitions.
          </p>
        </div>

        {albumsLoading ? (
          <div className="app-card mt-5 p-6 text-slate-300 font-semibold">Loading photo albums...</div>
        ) : albumsError ? (
          <div className="app-card mt-5 p-6 text-amber-200" role="status">{albumsError}</div>
        ) : albums.length === 0 ? (
          <div className="app-card mt-5 p-6 text-slate-300">No photo albums yet.</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((album) => (
              <article key={album.name} className="app-card p-4 flex flex-col overflow-hidden">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-blue-400/30 bg-[#07182F]">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={`${album.name} album cover`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                      No Photos Yet
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-50 break-words">{album.name}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {album.count} {album.count === 1 ? "photo" : "photos"}
                </p>
                <Link
                  to={`/gallery?album=${encodeURIComponent(album.name)}`}
                  className="mt-4 inline-flex self-start px-5 py-2.5 rounded-xl border border-blue-400/50 bg-blue-600 text-white font-bold hover:bg-blue-500 hover:shadow-[0_0_22px_rgba(59,130,246,0.35)] transition"
                >
                  View Photos →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
