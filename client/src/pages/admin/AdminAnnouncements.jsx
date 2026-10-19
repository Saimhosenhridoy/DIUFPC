 import { useEffect, useState } from "react";
import { gsAdmin } from "../../api/admin.gs";
import { useAuth } from "../../hooks/useAuth";

const paragraphStyle = {
  textAlign: "justify",
  textJustify: "inter-word",
  hyphens: "auto",
  WebkitHyphens: "auto",
  overflowWrap: "break-word",
  wordBreak: "normal",
  textAlignLast: "left",
};

export default function AdminAnnouncements() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setErr("");
      const data = await gsAdmin.listAnnouncements();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      setErr("");
      if (!title.trim() || !message.trim()) {
        setErr("Title and Message required.");
        return;
      }

      if (Boolean(linkTitle.trim()) !== Boolean(linkUrl.trim())) {
        setErr("Provide both Link Title and Link URL, or leave both empty.");
        return;
      }
      for (const value of [imageUrl.trim(), linkUrl.trim()]) {
        if (value && !/^https?:\/\//i.test(value)) {
          setErr("Image and link URLs must start with https:// or http://.");
          return;
        }
      }

      setSaving(true);
      await gsAdmin.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim(),
        linkTitle: linkTitle.trim(),
        linkUrl: linkUrl.trim(),
        priority: "NORMAL",
        status: "PUBLISHED",
        updatedBy: user?.email || "admin",
      });

      setTitle("");
      setMessage("");
      setImageUrl("");
      setLinkTitle("");
      setLinkUrl("");
      await load();
    } catch (e) {
      setErr(e.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete announcement?")) return;
    try {
      setErr("");
      await gsAdmin.deleteAnnouncement(id, user?.email || "admin");
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  };

  return (
    <div className="app-card p-6">
      <div className="text-xl font-extrabold text-[#f4f8ff]">Announcements</div>
      <div className="contact-underline mt-2" />

      {err && <div className="mt-4 text-red-300 font-bold">{err}</div>}

      <div className="mt-4 grid gap-3">
        <input
          className="contact-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="contact-input min-h-[120px]"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <input
          className="contact-input"
          type="url"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          className="contact-input"
          placeholder="Link Title (optional) e.g. Register Now"
          value={linkTitle}
          onChange={(e) => setLinkTitle(e.target.value)}
        />

        <input
          className="contact-input"
          type="url"
          placeholder="Link URL (optional)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />

        <button
          onClick={create}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#126de9] text-white font-bold hover:bg-[#2588ff] transition disabled:opacity-60"
        >
          {saving ? "Publishing..." : "Publish"}
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {items.map((x) => (
          <div
            key={x.id}
            className="app-card p-4 flex items-start justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[#f4f8ff] break-words">{x.title}</div>
              {/^https?:\/\//i.test(String(x.imageUrl || "")) && (
                <img src={x.imageUrl} alt={x.title || "Announcement image"}
                  loading="lazy" className="mt-3 w-full max-h-80 object-contain rounded-xl border border-blue-400/25 bg-[#07152D]"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              )}
              <div lang="en" style={paragraphStyle} className="text-sm text-[#b8cce8] mt-1 whitespace-pre-line leading-relaxed">
                {x.message}
              </div>
              {x.linkTitle && /^https?:\/\//i.test(String(x.linkUrl || "")) && (
                <a href={x.linkUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex mt-3 items-center gap-2 rounded-lg border border-blue-400/40 px-3 py-2 text-sm font-bold text-blue-200 hover:bg-blue-600/20 break-all">
                  {x.linkTitle} ↗
                </a>
              )}
              <div className="text-xs text-[#83a4cb] mt-2">
                {x.createdAt ? String(x.createdAt) : ""}
              </div>
            </div>

            <button
              onClick={() => del(x.id)}
              className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
