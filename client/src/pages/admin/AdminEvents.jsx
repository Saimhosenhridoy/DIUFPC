 import { useEffect, useMemo, useState } from "react";
import { gsAdmin } from "../../api/admin.gs";
import { useAuth } from "../../hooks/useAuth";

export default function AdminEvents() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [entryFee, setEntryFee] = useState("");

  // ✅ unify name = image (backend field)
  const [image, setImage] = useState("");

  const [status, setStatus] = useState("PUBLISHED");

  const [categoriesText, setCategoriesText] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [galleryText, setGalleryText] = useState("");

  const updatedBy = user?.email || "admin";
  const statusOptions = useMemo(() => ["PUBLISHED", "DRAFT"], []);

  function toSlug(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function listToJson(text) {
    const arr = String(text || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    return JSON.stringify(arr);
  }

  function jsonToComma(v) {
    try {
      const arr = JSON.parse(v || "[]");
      return Array.isArray(arr) ? arr.join(", ") : "";
    } catch {
      return "";
    }
  }

  async function load() {
    try {
      setErr("");
      const data = await gsAdmin.listEvents();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load events");
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSubtitle("");
    setShortDescription("");
    setFullDescription("");
    setStartDate("");
    setEndDate("");
    setDeadline("");
    setLocation("");
    setEntryFee("");
    setImage("");
    setStatus("PUBLISHED");
    setCategoriesText("");
    setRulesText("");
    setHighlightsText("");
    setGalleryText("");
  }

  function fillForEdit(ev) {
    setEditingId(ev.id);
    setTitle(ev.title || "");
    setSlug(ev.slug || "");
    setSubtitle(ev.subtitle || "");
    setShortDescription(ev.shortDescription || "");
    setFullDescription(ev.fullDescription || "");

    setStartDate(ev.startDate || "");
    setEndDate(ev.endDate || "");
    setDeadline(ev.deadline || "");
    setLocation(ev.location || "");
    setEntryFee(ev.entryFee || "");

    // ✅ support old + new field names
    setImage(ev.image || ev.coverImage || "");

    setStatus(String(ev.status || "PUBLISHED").toUpperCase());

    setCategoriesText(jsonToComma(ev.categories));
    setRulesText(jsonToComma(ev.rules));
    setHighlightsText(jsonToComma(ev.highlights));
    setGalleryText(jsonToComma(ev.gallery));
  }

  async function createOrUpdate() {
    if (!title.trim()) return alert("Title is required");

    const finalSlug = slug.trim() ? toSlug(slug) : toSlug(title);
    if (!finalSlug) return alert("Slug is invalid");

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      subtitle: subtitle.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),

      startDate: startDate.trim(),
      endDate: endDate.trim(),
      deadline: deadline.trim(),
      location: location.trim(),
      entryFee: entryFee.trim(),

      // ✅ backend expects image
      image: image.trim(),

      status,

      categories: listToJson(categoriesText),
      rules: listToJson(rulesText),
      highlights: listToJson(highlightsText),
      gallery: listToJson(galleryText),

      updatedBy,
    };

    try {
      setBusy(true);

      if (editingId) {
        await gsAdmin.updateEvent({ id: editingId, ...payload });
      } else {
        await gsAdmin.createEvent(payload);
      }

      resetForm();
      await load();
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete event?")) return;
    try {
      setBusy(true);
      await gsAdmin.deleteEvent(id, updatedBy);
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-card p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xl font-extrabold text-slate-900">Events</div>
          <div className="contact-underline mt-2" />
          <div className="text-sm text-slate-700 mt-2">
            Public page এ দেখাতে চাইলে Status অবশ্যই <b>PUBLISHED</b> দিতে হবে।
          </div>
        </div>

        <button
          onClick={resetForm}
          className="px-4 py-2 rounded-lg border font-bold text-slate-900 hover:bg-white/60 transition"
          disabled={busy}
        >
          + New Event
        </button>
      </div>

      {err && <div className="mt-4 text-red-700 font-bold">{err}</div>}

      {/* FORM */}
      <div className="mt-6 app-card p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-lg font-extrabold text-slate-900">
            {editingId ? "Edit Event" : "Create New Event"}
          </div>
          {editingId ? (
            <div className="text-sm text-slate-700">
              Editing ID: <span className="font-bold">{editingId}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="contact-input"
            placeholder="Event Title *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug.trim()) setSlug(toSlug(e.target.value));
            }}
            disabled={busy}
          />

          <input
            className="contact-input"
            placeholder="Slug (auto) e.g. shutter-stories"
            value={slug}
            onChange={(e) => setSlug(toSlug(e.target.value))}
            disabled={busy}
          />

          <input
            className="contact-input"
            placeholder="Subtitle (optional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            disabled={busy}
          />

          <select
            className="contact-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={busy}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          <input
            className="contact-input"
            placeholder="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={busy}
          />

          <input
            className="contact-input"
            placeholder="End Date (YYYY-MM-DD)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={busy}
          />

          <input
            className="contact-input"
            placeholder="Registration Deadline (YYYY-MM-DD)"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={busy}
          />

          <input
            className="contact-input"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={busy}
          />

          <input
            className="contact-input"
            placeholder="Entry Fee (e.g. 1020 BDT / Free)"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            disabled={busy}
          />

          <input
            className="contact-input md:col-span-2"
            placeholder="Cover Image URL (Cloudinary / Drive direct / etc.)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={busy}
          />

          {/* ✅ preview */}
          {image.trim() ? (
            <div className="md:col-span-2 overflow-hidden rounded-2xl border">
              <img
                src={image.trim()}
                alt="Cover Preview"
                className="w-full h-56 object-cover"
                onError={(ev) => {
                  ev.currentTarget.style.display = "none";
                }}
              />
              <div className="p-3 text-xs text-slate-700">
                যদি preview না আসে, লিংকটা সম্ভবত expire / private / hotlink blocked.
              </div>
            </div>
          ) : null}

          <input
            className="contact-input md:col-span-2"
            placeholder="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            disabled={busy}
          />

          <textarea
            className="contact-input md:col-span-2 min-h-[130px]"
            placeholder="Full Description (long text)"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            disabled={busy}
          />

          <textarea
            className="contact-input md:col-span-2 min-h-[90px]"
            placeholder="Categories (comma separated) e.g. Single Photo, Photo Story"
            value={categoriesText}
            onChange={(e) => setCategoriesText(e.target.value)}
            disabled={busy}
          />

          <textarea
            className="contact-input md:col-span-2 min-h-[90px]"
            placeholder="Rules (comma separated)"
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            disabled={busy}
          />

          <textarea
            className="contact-input md:col-span-2 min-h-[90px]"
            placeholder="Highlights (comma separated)"
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            disabled={busy}
          />

          <textarea
            className="contact-input md:col-span-2 min-h-[90px]"
            placeholder="Gallery Image URLs (comma separated)"
            value={galleryText}
            onChange={(e) => setGalleryText(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={createOrUpdate}
            disabled={busy}
            className="px-5 py-3 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {busy ? "Saving..." : editingId ? "Update Event" : "Add Event"}
          </button>

          {editingId ? (
            <button
              onClick={resetForm}
              disabled={busy}
              className="px-5 py-3 rounded-xl border font-extrabold text-slate-900 hover:bg-white/60 transition disabled:opacity-50"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>

      {/* LIST */}
      <div className="mt-6">
        <div className="text-lg font-extrabold text-slate-900">All Events</div>
        <div className="contact-underline mt-2" />

        <div className="mt-4 space-y-3">
          {items.map((x) => (
            <div
              key={x.id}
              className="app-card p-4 flex items-start justify-between gap-4 flex-wrap"
            >
              <div className="min-w-[240px]">
                <div className="font-extrabold text-slate-900">{x.title}</div>
                <div className="text-sm text-slate-700 mt-1">
                  <span className="font-bold">Slug:</span> {x.slug || "-"}
                </div>
                <div className="text-sm text-slate-700">
                  {[x.startDate, x.endDate].filter(Boolean).join(" - ") || "-"}{" "}
                  {x.location ? `• ${x.location}` : ""}
                </div>
                {x.deadline ? (
                  <div className="text-sm text-slate-700">
                    <span className="font-bold">Deadline:</span> {x.deadline}
                  </div>
                ) : null}
                {x.shortDescription ? (
                  <div className="text-sm text-slate-700 mt-1">
                    {x.shortDescription}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full border font-bold text-slate-800">
                  {String(x.status || "").toUpperCase()}
                </span>

                <button
                  onClick={() => fillForEdit(x)}
                  disabled={busy}
                  className="px-3 py-2 rounded-lg border font-bold text-slate-900 hover:bg-white/60 transition disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  onClick={() => del(x.id)}
                  disabled={busy}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!items.length && !err && (
            <div className="app-card p-5 text-slate-700">
              No events yet. Create your first event above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
