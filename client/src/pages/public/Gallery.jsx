 // src/pages/public/Gallery.jsx
import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_GALLERY_API_URL;
const PAGE_SIZE = 9; // 3x3 on desktop

function buildPageItems(total, current) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [];
  items.push(1);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) items.push("dots-left");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("dots-right");

  items.push(total);
  return items;
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState(["all"]);
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllFilters, setShowAllFilters] = useState(false);

  async function load() {
    try {
      setLoading(true);

      const [gRes, eRes] = await Promise.all([
        fetch(`${API_URL}?action=getGallery`),
        fetch(`${API_URL}?action=getEvents`),
      ]);

      const gJson = await gRes.json();
      const eJson = await eRes.json();

      const gallery = gJson?.status === "success" ? gJson.data : [];
      const evs = eJson?.status === "success" ? eJson.data : [];

      setPhotos(
        (gallery || []).map((p) => ({
          id: String(p.id || ""),
          imageUrl: (p.imageUrl || "").toString(),
          title: (p.title || "").toString(),
          event: (p.event || "").toString(),
          facebookPost: (p.facebookPost || "").toString(),
        }))
      );

      setEvents(["all", ...(evs || []).map((x) => x.name)]);
    } catch (err) {
      console.error(err);
      setPhotos([]);
      setEvents(["all"]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return active === "all" ? photos : photos.filter((p) => p.event === active);
  }, [photos, active]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const current = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [active]);

  // show only first 15 filters by default
  const visibleFilters = useMemo(() => {
    if (showAllFilters) return events;
    return events.slice(0, 15);
  }, [events, showAllFilters]);

  const hasMoreFilters = events.length > 15;

  // ===== Loading UI (toast center) =====
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* Center Toast */}
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
          <div
            className="
              pointer-events-none
              app-card
              px-6 py-4
              text-center
              shadow-lg
              border border-blue-200/70
              bg-white/85
              backdrop-blur
            "
            style={{ minWidth: 320 }}
          >
            <div className="text-[#112240] font-extrabold text-lg">
              Please wait a moment…
            </div>
            <div className="text-slate-600 text-sm mt-1">
              We’re loading the photo gallery for you.
            </div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="app-card p-5">
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-[#112240] inline-block">
              Photo Gallery
              <span className="block h-[3px] w-full bg-blue-500/80 rounded mt-2" />
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Moments captured through our lens — workshops, photowalks &
              exhibitions.
            </p>
          </div>

          {/* ✅ Mobile: 1 col | sm: 2 col | md+: 3 col */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/40 border border-blue-200/50 animate-pulse"
                style={{ aspectRatio: "4 / 3" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pageItems = buildPageItems(totalPages, page);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* ===== Main card ===== */}
      <div className="app-card p-4 mb-5">
        {/* Title Center */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112240] inline-block">
            Photo Gallery
            <span className="block h-[3px] w-full bg-blue-500/80 rounded mt-2" />
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Moments captured through our lens — workshops, photowalks &
            exhibitions.
          </p>
        </div>

        {/* Filters (1 row = 5 cards on large screen) */}
        <div className="mt-4 max-h-[16vh] overflow-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {visibleFilters.map((name) => {
              const isOn = active === name;
              return (
                <button
                  key={name}
                  onClick={() => setActive(name)}
                  className={[
                    "w-full text-left rounded-xl border transition",
                    "px-2.5 py-2",
                    "text-[11px] sm:text-xs font-semibold leading-snug",
                    isOn
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-blue-200 bg-blue-50/40 text-[#112240] hover:bg-blue-50",
                  ].join(" ")}
                  title={name === "all" ? "All Albums" : name}
                >
                  <span className="line-clamp-2">
                    {name === "all" ? "All Albums" : name}
                  </span>
                </button>
              );
            })}
          </div>

          {hasMoreFilters && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setShowAllFilters((s) => !s)}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                {showAllFilters ? "Show less" : `Show more (${events.length - 15})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Photos grid (ratio fixed) ===== */}
      {/* ✅ Mobile: 1 col | sm: 2 col | md+: 3 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {current.map((p) => (
          <button
            key={p.id + p.imageUrl}
            onClick={() => setSelected(p)}
            className="
              group relative overflow-hidden rounded-2xl
              border border-blue-200/70 bg-white/50
              hover:border-blue-400 transition
            "
            title={p.title || p.event}
          >
            <div style={{ aspectRatio: "4 / 3" }} className="w-full">
              <img
                src={p.imageUrl}
                alt={p.title || "Gallery"}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {(p.title || p.event) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 py-2">
                <div className="text-sm font-semibold text-white leading-tight line-clamp-2">
                  {p.title || p.event}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ===== Pagination with dots ===== */}
      {totalPages > 1 && (
        <div className="app-card p-4 mt-8">
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-[#112240] font-semibold disabled:opacity-40"
            >
              Prev
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {pageItems.map((it, idx) => {
                if (typeof it === "string" && it.startsWith("dots")) {
                  return (
                    <span
                      key={it + idx}
                      className="px-2 text-slate-500 font-bold"
                      aria-hidden="true"
                    >
                      ···
                    </span>
                  );
                }

                const n = it;
                const isOn = page === n;

                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={[
                      "min-w-9 h-9 px-3 rounded-full text-sm font-semibold border transition",
                      isOn
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white/60 text-[#112240] border-blue-200 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-[#112240] font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ===== Lightbox ===== */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-4xl w-full rounded-2xl overflow-hidden border border-white/20 bg-[#0b1530]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.imageUrl}
              alt={selected.title || "Photo"}
              className="w-full max-h-[75vh] object-contain bg-black"
            />

            <div className="p-4">
              <div className="text-white font-semibold">
                {selected.title || selected.event}
              </div>
              <div className="text-slate-300 text-sm mt-1">{selected.event}</div>

              <div className="mt-3 flex gap-2">
                {selected.facebookPost && (
                  <a
                    href={selected.facebookPost}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-blue-500/90 text-white font-semibold hover:bg-blue-500 transition"
                  >
                    View on Facebook
                  </a>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
