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

import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

const inputClass =
  "contact-input w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none text-slate-900";

export default function RegisterEvent() {
  const { slug } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [photos, setPhotos] = useState([
    { file: null, title: "", caption: "" },
  ]);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institute, setInstitute] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => {
    try {
      const raw = event?.categories || "[]";
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [event]);

  const deadlineStr = useMemo(() => dateOnly(event?.deadline), [event?.deadline]);
  const startStr = useMemo(() => dateOnly(event?.startDate), [event?.startDate]);

  const regClosed = useMemo(
    () => (deadlineStr ? isPast(deadlineStr, "end") : false),
    [deadlineStr]
  );

  useEffect(() => {
    if (!submitStatus) return;

    const timer = setTimeout(() => {
      setSubmitStatus(null);
      setSubmitMessage("");
    }, 5000);

    return () => clearTimeout(timer);
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

    return () => {
      mounted = false;
    };
  }, [slug]);

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handlePhotoFileChange = (index, e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10MB.");
      return;
    }

    setPhotos((prev) =>
      prev.map((photo, i) =>
        i === index ? { ...photo, file: selectedFile } : photo
      )
    );
  };

  const updatePhotoField = (index, field, value) => {
    setPhotos((prev) =>
      prev.map((photo, i) =>
        i === index ? { ...photo, [field]: value } : photo
      )
    );
  };

  const addPhotoBox = () => {
    setPhotos((prev) => {
      if (prev.length >= 5) {
        alert("Maximum 5 photos allowed.");
        return prev;
      }

      return [...prev, { file: null, title: "", caption: "" }];
    });
  };

  const removePhotoBox = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    if (!name.trim() || !email.trim() || !phone.trim() || !institute.trim()) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Please fill required fields (Name, Email, Phone, Institute)."
      );
      setShowRulesPopup(false);
      return;
    }

    if (!photos[0]?.file) {
      setSubmitStatus("error");
      setSubmitMessage("Please upload at least 1 photo.");
      setShowRulesPopup(false);
      return;
    }

    setSubmitting(true);
    setShowRulesPopup(false);

    try {
      const photoUploads = await Promise.all(
        photos
          .filter((photo) => photo.file)
          .map(async (photo) => ({
            fileData: await convertToBase64(photo.file),
            fileName: photo.file.name,
            fileType: photo.file.type,
            title: photo.title.trim(),
            caption: photo.caption.trim(),
          }))
      );

      await gsPublic.registerEvent({
        eventSlug: slug,
        category,
        name,
        studentId,
        email,
        phone,
        institute,
        agreementAccepted: "true",
        photos: JSON.stringify(photoUploads),
      });

      setSubmitStatus("success");
      setSubmitMessage(
        `🎉 Registration submitted for: ${
          event?.title || slug
        }\nWe will contact you soon.`
      );

      setName("");
      setStudentId("");
      setEmail("");
      setPhone("");
      setInstitute("");
      setCategory("");
      setPhotos([{ file: null, title: "", caption: "" }]);
      setAgreementAccepted(false);
    } catch (e) {
      setSubmitStatus("error");
      setSubmitMessage(e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen px-4 py-10">Loading...</div>;
  }

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
          <div className="text-xl font-extrabold text-slate-900">
            Event not found
          </div>

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
        <div className="app-card p-8 text-center text-slate-900">
          <h1 className="text-3xl md:text-5xl font-extrabold">
            {event.title}
          </h1>

          <div className="contact-underline mx-auto mt-3" />

          {event.subtitle ? (
            <p className="mt-3 text-slate-700">{event.subtitle}</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3">
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

        {regClosed ? (
          <div className="app-card p-7 text-center text-slate-900">
            <div className="text-2xl font-extrabold">Registration Closed</div>

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
          <div className="app-card p-7 text-slate-900">
            <h2 className="text-2xl font-extrabold text-center">
              Event Registration
            </h2>

            <div className="contact-underline mx-auto mt-2" />

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="app-card p-5 text-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="join-subcardLabel text-slate-900">
                      Full Name *
                    </label>

                    <input
                      className={inputClass}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="join-subcardLabel text-slate-900">
                      Student ID (Optional)
                    </label>

                    <input
                      className={inputClass}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="join-subcardLabel text-slate-900">
                      Email *
                    </label>

                    <input
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="join-subcardLabel text-slate-900">
                      Phone *
                    </label>

                    <input
                      className={inputClass}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel text-slate-900">
                      Institute *
                    </label>

                    <input
                      className={inputClass}
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel text-slate-900">
                      Category (Optional)
                    </label>

                    <select
                      className={inputClass}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select category optional</option>

                      {categories.map((categoryItem) => (
                        <option key={categoryItem} value={categoryItem}>
                          {categoryItem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <label className="join-subcardLabel flex items-center gap-2 text-slate-900">
                        <ImageIcon size={16} />
                        Submit Photos * (1 Required, Max 5)
                      </label>

                      <button
                        type="button"
                        onClick={addPhotoBox}
                        disabled={submitting || photos.length >= 5}
                        className="app-card px-4 py-2 bg-white text-black border-2 border-slate-300 font-extrabold hover:bg-slate-100 transition disabled:opacity-50"
                      >
                        + Add Photo
                      </button>
                    </div>

                    <div className="space-y-4">
                      {photos.map((photo, index) => (
                        <div
                          key={index}
                          className="app-card p-4 border-2 border-slate-200 bg-white text-slate-900"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="font-extrabold">
                              Photo {index + 1}{" "}
                              {index === 0 ? "(Required)" : "(Optional)"}
                            </div>

                            {photos.length > 1 && index !== 0 ? (
                              <button
                                type="button"
                                onClick={() => removePhotoBox(index)}
                                disabled={submitting}
                                className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition disabled:opacity-50"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>

                          <div className="space-y-3">
                            <input
                              className={inputClass}
                              placeholder="Photo title (Optional)"
                              value={photo.title}
                              onChange={(e) =>
                                updatePhotoField(index, "title", e.target.value)
                              }
                              disabled={submitting}
                            />

                            <textarea
                              className="contact-input w-full min-h-[90px] bg-white border-2 border-slate-300 rounded-xl px-4 py-3 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none text-slate-900"
                              placeholder="Photo caption / description (Optional)"
                              value={photo.caption}
                              onChange={(e) =>
                                updatePhotoField(
                                  index,
                                  "caption",
                                  e.target.value
                                )
                              }
                              disabled={submitting}
                            />

                            <div className="join-fileWrap">
                              <label className="join-fileBtn">
                                <ImageIcon size={18} />
                                Choose Photo

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handlePhotoFileChange(index, e)
                                  }
                                  className="join-fileHidden"
                                  disabled={submitting}
                                />
                              </label>

                              <div className="join-fileMeta">
                                {photo.file
                                  ? `Selected: ${photo.file.name}`
                                  : "No file selected"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="app-card p-5 border-2 border-slate-200 shadow-md bg-white text-slate-900">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full app-card p-4 bg-white text-black border-2 border-slate-300 font-extrabold flex items-center justify-center gap-2 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />

                  <span>
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </span>
                </button>

                <p className="mt-3 text-sm text-slate-600 text-center">
                  You will see the agreement before final submission.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {showRulesPopup && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card w-full max-w-2xl p-6 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="contact-badge">
                <FileSignature size={18} />
              </div>

              <div className="text-xl font-extrabold">
                Submission Agreement
              </div>
            </div>

            <div className="mt-4 app-card p-5 max-h-[50vh] overflow-y-auto text-slate-900">
              <div className="font-bold mb-2">General Rules</div>

              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Submitted work must be original.</li>
                <li>No watermark/signature.</li>
                <li>
                  Organizer may use selected photos for promotion with credits.
                </li>
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
                className="app-card flex-1 p-3 bg-white text-black border-2 border-slate-300 font-extrabold hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
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