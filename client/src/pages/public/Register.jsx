import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { createSubmissionApi } from "../../api/submissions.api";
import { useSubmissions } from "../../hooks/useSubmissions";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { reloadMySubmissions } = useSubmissions();
  const { user } = useAuth();

  const event = useMemo(() => events.find((e) => e.slug === slug), [events, slug]);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    studentId: "",
    category: "",
    title: "",
    description: "",
  });

  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold">Event not found</h2>
      </div>
    );
  }

  function onChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.category || !form.title) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await createSubmissionApi(event.slug, {
        ...form,
        fileName,
        eventTitle: event.title,
      });
      await reloadMySubmissions();
      navigate("/dashboard/submissions");
    } catch {
      setError("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border bg-white p-8">
        <h2 className="text-2xl font-semibold">Registration</h2>
        <p className="mt-2 text-gray-600">
          Event: <span className="font-medium">{event.title}</span>
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                name="name"
                value={form.name}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                name="email"
                value={form.email}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone *</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                name="phone"
                value={form.phone}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                name="studentId"
                value={form.studentId}
                onChange={onChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            <select
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
              name="category"
              value={form.category}
              onChange={onChange}
            >
              <option value="">Select</option>
              {event.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              className="mt-1 w-full px-3 py-2 border rounded-lg"
              name="title"
              value={form.title}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full px-3 py-2 border rounded-lg min-h-28"
              name="description"
              value={form.description}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Upload (mock)</label>
            <input
              className="mt-1 w-full"
              type="file"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
            {fileName ? (
              <div className="text-sm text-gray-600 mt-1">Selected: {fileName}</div>
            ) : null}
          </div>

          <button
            disabled={submitting}
            className="w-full px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Note: File upload is mocked now. It will be stored in Cloudinary once backend is connected.
        </p>
      </div>
    </div>
  );
}
