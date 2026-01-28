 import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsPublic } from "../../api/public.gs";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  FileSignature,
  Image as ImageIcon,
} from "lucide-react";

// ✅ reusable countdown helpers
import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

export default function RegisterEvent() {
  const { slug } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // success | error | null
  const [submitMessage, setSubmitMessage] = useState("");

  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [file, setFile] = useState(null);

  // form states
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institute, setInstitute] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");

  // parse JSON array fields safely
  const categories = useMemo(() => {
    try {
      const raw = event?.categories || "[]";
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [event]);

  // ✅ normalize dates
  const deadlineStr = useMemo(() => dateOnly(event?.deadline), [event?.deadline]);
  const startStr = useMemo(() => dateOnly(event?.startDate), [event?.startDate]);
  const regClosed = useMemo(
    () => (deadlineStr ? isPast(deadlineStr, "end") : false),
    [deadlineStr]
  );

  // auto hide toast
  useEffect(() => {
    if (!submitStatus) return;
    const t = setTimeout(() => {
      setSubmitStatus(null);
      setSubmitMessage("");
    }, 5000);
    return () => clearTimeout(t);
  }, [submitStatus]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setErr("");
        setLoading(true);
        const data = await gsPublic.publicEventBySlug(slug);
        if (mounted) setEvent(data);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load event");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [slug]);

  const convertToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ hard block if closed
    if (regClosed) {
      setSubmitStatus("error");
      setSubmitMessage("Registration is closed (deadline passed).");
      return;
    }

    setSubmitStatus(null);
    setSubmitMessage("");
    setShowRulesPopup(true);
  };

  const handleFinalSubmit = async () => {
    if (regClosed) {
      setSubmitStatus("error");
      setSubmitMessage("Registration is closed (deadline passed).");
      setShowRulesPopup(false);
      return;
    }

    if (!agreementAccepted) {
      alert("Please accept the agreement to continue.");
      return;
    }

    if (!name.trim() || !email.trim() || !category.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("Please fill required fields (Name, Email, Category).");
      setShowRulesPopup(false);
      return;
    }

    setSubmitting(true);
    setShowRulesPopup(false);

    try {
      let fileData = "";
      let fileName = "";
      let fileType = "";

      if (file) {
        fileData = await convertToBase64(file);
        fileName = file.name;
        fileType = file.type;
      }

      await gsPublic.registerEvent({
        eventSlug: slug,
        category,
        name,
        studentId,
        email,
        phone,
        institute,
        caption,
        agreementAccepted: "true",
        fileData,
        fileName,
        fileType,
      });

      setSubmitStatus("success");
      setSubmitMessage(
        `🎉 Registration submitted for: ${event?.title || slug}\nWe will contact you soon.`
      );

      // reset
      setName("");
      setStudentId("");
      setEmail("");
      setPhone("");
      setInstitute("");
      setCaption("");
      setCategory("");
      setFile(null);
      setAgreementAccepted(false);
    } catch (e) {
      setSubmitStatus("error");
      setSubmitMessage(e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen px-4 py-10">Loading...</div>;

  if (err) {
    return (
      <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <div className="app-card p-6">
          <div className="text-xl font-extrabold text-red-700">Error</div>
          <div className="mt-2 text-slate-700">{err}</div>
          <Link to="/events" className="inline-block mt-4 underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <div className="app-card p-6">
          <div className="text-xl font-extrabold text-slate-900">Event not found</div>
          <Link to="/events" className="inline-block mt-4 underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      {submitStatus && (
        <div className={`toast-center ${submitStatus}`}>
          <div className="toast-center-content">
            {submitStatus === "success" ? (
              <CheckCircle2 size={26} />
            ) : (
              <AlertTriangle size={26} />
            )}
            <span className="whitespace-pre-line">{submitMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="app-card p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
            {event.title}
          </h1>
          <div className="contact-underline mx-auto mt-3" />
          {event.subtitle ? <p className="mt-3 text-slate-700">{event.subtitle}</p> : null}

          <div className="mt-4 flex flex-col gap-3">
            {/* ✅ countdowns */}
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

            <p className="text-slate-700">
              Deadline: <b>{deadlineStr || "N/A"}</b> • Location:{" "}
              <b>{event.location || "N/A"}</b>
            </p>

            {/* ✅ status badge */}
            {deadlineStr ? (
              <div className="flex justify-center">
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
        </div>

        {/* CLOSED NOTICE */}
        {regClosed ? (
          <div className="app-card p-7 text-center">
            <div className="text-2xl font-extrabold text-slate-900">
              Registration Closed
            </div>
            <p className="mt-2 text-slate-700 font-semibold">
              The deadline has passed. You can still view event details.
            </p>
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <Link
                to={`/events/${event.slug}`}
                className="px-5 py-3 rounded-xl border font-extrabold text-slate-900 hover:bg-white/60 transition"
              >
                View Details
              </Link>
              <Link
                to="/events"
                className="px-5 py-3 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition"
              >
                Back to Events
              </Link>
            </div>
          </div>
        ) : (
          /* FORM */
          <div className="app-card p-7">
            <h2 className="text-2xl font-extrabold text-slate-900 text-center">
              Event Registration
            </h2>
            <div className="contact-underline mx-auto mt-2" />

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="app-card p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="join-subcardLabel">Full Name *</label>
                    <input
                      className="contact-input w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="join-subcardLabel">Student ID</label>
                    <input
                      className="contact-input w-full"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="join-subcardLabel">Email *</label>
                    <input
                      className="contact-input w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="join-subcardLabel">Phone</label>
                    <input
                      className="contact-input w-full"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel">Institute</label>
                    <input
                      className="contact-input w-full"
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel">Category *</label>
                    <select
                      className="contact-input w-full"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel">
                      Caption / Story Description
                    </label>
                    <textarea
                      className="contact-input w-full min-h-[120px]"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel flex items-center gap-2">
                      <ImageIcon size={16} /> Submit Photo (Optional)
                    </label>

                    <div className="join-fileWrap">
                      <label className="join-fileBtn">
                        <ImageIcon size={18} />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="join-fileHidden"
                          disabled={submitting}
                        />
                      </label>

                      <div className="join-fileMeta">
                        {file ? `Selected: ${file.name}` : "No file selected"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="app-card p-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="contact-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={18} />
                  <span>{submitting ? "Submitting..." : "Submit Registration"}</span>
                </button>
                <p className="mt-3 text-sm text-slate-600 text-center">
                  You will see the agreement before final submission.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* AGREEMENT POPUP */}
      {showRulesPopup && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card w-full max-w-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="contact-badge">
                <FileSignature size={18} />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                Submission Agreement
              </div>
            </div>

            <div className="mt-4 app-card p-5 max-h-[50vh] overflow-y-auto">
              <div className="text-slate-800 font-bold mb-2">General Rules</div>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Submitted work must be original.</li>
                <li>No watermark/signature.</li>
                <li>Organizer may use selected photos for promotion with credits.</li>
                <li>Any violation can cause disqualification.</li>
              </ul>

              <label className="mt-4 app-card p-4 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                />
                <span className="font-bold text-slate-900">
                  I accept the agreement and terms
                </span>
              </label>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!agreementAccepted || submitting}
                className="contact-btn flex-1 disabled:opacity-50"
              >
                Confirm & Submit
              </button>

              <button
                type="button"
                onClick={() => setShowRulesPopup(false)}
                className="app-card flex-1 p-3 font-bold text-slate-900 hover:bg-white/60 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
