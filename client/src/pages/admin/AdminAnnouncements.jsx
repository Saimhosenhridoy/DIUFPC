 import { useEffect, useState } from "react";
import { gsAdmin } from "../../api/admin.gs";
import { useAuth } from "../../hooks/useAuth";

export default function AdminAnnouncements() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

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

      setSaving(true);
      await gsAdmin.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        priority: "NORMAL",
        status: "PUBLISHED",
        updatedBy: user?.email || "admin",
      });

      setTitle("");
      setMessage("");
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
      <div className="text-xl font-extrabold text-slate-900">Announcements</div>
      <div className="contact-underline mt-2" />

      {err && <div className="mt-4 text-red-700 font-bold">{err}</div>}

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

        <button
          onClick={create}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
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
            <div className="flex-1">
              <div className="font-extrabold text-slate-900">{x.title}</div>
              <div className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                {x.message}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {x.createdAt ? String(x.createdAt) : ""}
              </div>
            </div>

            <button
              onClick={() => del(x.id)}
              className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
