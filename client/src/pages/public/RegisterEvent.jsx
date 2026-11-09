// src/pages/public/RegisterEvent.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsPublic } from "../../api/public.gs";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  FileSignature,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import Countdown, { isPast, dateOnly } from "../../components/ui/Countdown";

const inputClass =
  "contact-input w-full bg-[#0B213E] border-2 border-blue-400/35 rounded-xl px-4 py-3 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 outline-none text-slate-50";

const GS_BASE_URL = import.meta.env.VITE_ADMIN_GS_URL;

export default function RegisterEvent() {
  const { slug } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [uploadProgressText, setUploadProgressText] = useState("");

  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [photos, setPhotos] = useState([
    { file: null, fileData: "", title: "", caption: "", fileName: "", fileType: "" },
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
    }, 7000);

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
      reader.onerror = (e) => reject(reader.error || e || new Error("Failed to read file"));
    });

  // Upload a single photo individually to Google Drive
  const uploadSinglePhoto = async ({ eventSlug, name, phone, photoNo, file, fileData }) => {
    const qs = new URLSearchParams({ action: "uploadEventPhoto" }).toString();
    const body = new URLSearchParams();
    body.append("eventSlug", eventSlug);
    body.append("name", name);
    body.append("phone", phone);
    body.append("photoNo", String(photoNo));
    body.append("fileData", fileData);
    body.append("fileName", file.name);
    body.append("fileType", file.type || "image/jpeg");

    const res = await fetch(`${GS_BASE_URL}?${qs}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: body.toString(),
    });

    const json = await res.json();
    if (!json?.success) throw new Error(json?.message || "Failed to upload photo");
    return json.data;
  };

  // Cache selected photo reference lightly without bloating memory
  const handlePhotoFileChange = (index, e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Max 10MB per photo
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10MB.");
      return;
    }

    // Store file metadata and File pointer (tiny memory footprint, prevents mobile OOM)
    setPhotos((prev) =>
      prev.map((photo, i) =>
        i === index
          ? {
              ...photo,
              file: selectedFile,
              fileName: selectedFile.name,
              fileType: selectedFile.type || "image/jpeg",
            }
          : photo
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

      return [
        ...prev,
        { file: null, fileData: "", title: "", caption: "", fileName: "", fileType: "" },
      ];
    });
  };

  const removePhotoBox = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !institute.trim()) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Please fill required fields (Name, Email, Phone (WhatsApp), Institution Name / Freelancer)."
      );
      return false;
    }

    if (categories.length > 0 && !category.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("Please select a Category.");
      return false;
    }

    if (!photos[0]?.file && !photos[0]?.fileData) {
      setSubmitStatus("error");
      setSubmitMessage("Please upload at least 1 photo.");
      return false;
    }

    const missingTitleIndex = photos.findIndex(
      (photo) => (photo.file || photo.fileData) && !photo.title.trim()
    );
    if (missingTitleIndex !== -1) {
      setSubmitStatus("error");
      setSubmitMessage(
        `Please provide a Photo Title for Photo ${missingTitleIndex + 1}.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (regClosed) {
      setSubmitStatus("error");
      setSubmitMessage("Registration is closed (deadline passed).");
      return;
    }

    if (!validateForm()) return;

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

    if (!validateForm()) {
      setShowRulesPopup(false);
      return;
    }

    setSubmitting(true);
    setShowRulesPopup(false);

    try {
      const activePhotos = photos.filter((photo) => photo.file || photo.fileData);
      const totalPhotos = activePhotos.length;
      const uploadedPhotosMeta = [];

      // Upload each photo one by one sequentially
      for (let i = 0; i < totalPhotos; i++) {
        const photo = activePhotos[i];
        setUploadProgressText(`Uploading photo ${i + 1} of ${totalPhotos}...`);

        let base64Data = photo.fileData;
        if (!base64Data && photo.file) {
          base64Data = await convertToBase64(photo.file);
        }

        if (!base64Data) {
          throw new Error(
            `Could not read photo ${i + 1}. Please re-select the photo and try again.`
          );
        }

        // Upload with automatic retry on temporary network glitch
        let uploadRes = null;
        let lastUploadErr = null;

        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            uploadRes = await uploadSinglePhoto({
              eventSlug: slug,
              name,
              phone,
              photoNo: i + 1,
              file: {
                name: photo.fileName || photo.file?.name || `photo_${i + 1}.jpg`,
                type: photo.fileType || photo.file?.type || "image/jpeg",
              },
              fileData: base64Data,
            });
            break; // Success!
          } catch (err) {
            lastUploadErr = err;
            if (attempt < 2) {
              setUploadProgressText(
                `Reconnecting photo ${i + 1} of ${totalPhotos}...`
              );
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        }

        if (!uploadRes) {
          throw (
            lastUploadErr ||
            new Error(`Failed to upload photo ${i + 1}. Please try again.`)
          );
        }

        uploadedPhotosMeta.push({
          fileUrl: uploadRes.fileUrl,
          fileName: uploadRes.fileName,
          fileType: uploadRes.fileType,
          title: photo.title.trim(),
          caption: photo.caption.trim(),
        });
        base64Data = null;
      }

      setUploadProgressText("Finalizing registration...");

      // Final registration metadata submission
      await gsPublic.registerEvent({
        eventSlug: slug,
        category,
        name,
        studentId,
        email,
        phone,
        institute,
        agreementAccepted: "true",
        photos: JSON.stringify(uploadedPhotosMeta),
      });

      setSubmitStatus("success");
      setSubmitMessage(
        `🎉 Registration submitted for: ${
          event?.title || slug
        }\nWe will contact you soon.`
      );

      // Reset form
      setName("");
      setStudentId("");
      setEmail("");
      setPhone("");
      setInstitute("");
      setCategory("");
      setPhotos([
        { file: null, fileData: "", title: "", caption: "", fileName: "", fileType: "" },
      ]);
      setAgreementAccepted(false);
    } catch (e) {
      console.error("Registration submission error:", e);
      const rawMsg = e?.message || "";
      let errMsg = rawMsg || "Registration failed";

      if (
        rawMsg.includes("Failed to fetch") ||
        rawMsg.includes("NetworkError") ||
        rawMsg.includes("network")
      ) {
        errMsg = "Network connection error. Please check your internet connection and try again.";
      } else if (
        rawMsg.includes("NotReadableError") ||
        rawMsg.includes("could not be read")
      ) {
        errMsg =
          "Could not read the photo file from your device. Please re-select the photo and try again.";
      } else if (rawMsg) {
        errMsg = `Registration failed: ${rawMsg}`;
      }

      setSubmitStatus("error");
      setSubmitMessage(errMsg);
    } finally {
      setSubmitting(false);
      setUploadProgressText("");
    }
  };

  if (loading) {
    return <div className="min-h-screen px-4 py-10 text-white text-center">Loading...</div>;
  }

  if (err) {
    return (
      <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <div className="app-card p-6">
          <div className="text-xl font-extrabold text-red-300">Error</div>
          <div className="mt-2 text-slate-300">{err}</div>
          <Link to="/events" className="inline-block mt-4 underline text-sky-400">
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
          <div className="text-xl font-extrabold text-slate-50">
            Event not found
          </div>
          <Link to="/events" className="inline-block mt-4 underline text-sky-400">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      {/* Toast popup */}
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

      {/* Live Uploading Progress Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#06162e] border-2 border-blue-400/50 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-sky-400 border-t-transparent animate-spin flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
            </div>

            <div className="text-white font-extrabold text-lg">
              Submitting Registration
            </div>

            <div className="bg-sky-500/15 border border-sky-400/40 rounded-2xl py-3 px-4 text-sky-200 font-bold text-sm tracking-wide">
              {uploadProgressText || "Processing..."}
            </div>

            <p className="text-xs text-slate-400">
              Please do not close or refresh this page while your photos are being uploaded.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="app-card p-8 text-center text-slate-50">
          <h1 className="text-3xl md:text-5xl font-extrabold">
            {event.title}
          </h1>

          <div className="contact-underline mx-auto mt-3" />

          {event.subtitle ? (
            <p className="mt-3 text-slate-300">{event.subtitle}</p>
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

            <p className="text-slate-300">
              Deadline: <b>{deadlineStr || "N/A"}</b> • Location:{" "}
              <b>{event.location || "N/A"}</b>
            </p>

            {deadlineStr ? (
              <div className="flex justify-center">
                <span
                  className={`text-xs px-4 py-2 rounded-full font-extrabold border ${
                    regClosed
                      ? "bg-[#07152D]/95 text-white border-blue-400/30"
                      : "bg-[#102746]/85 text-slate-50 border-blue-400/25"
                  }`}
                >
                  {regClosed ? "Registration Closed" : "Registration Open"}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {regClosed ? (
          <div className="app-card p-7 text-center text-slate-50">
            <div className="text-2xl font-extrabold">Registration Closed</div>
            <p className="mt-2 text-slate-300 font-semibold">
              The deadline has passed. You can still view event details.
            </p>
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <Link
                to={`/events/${event.slug}`}
                className="px-5 py-3 rounded-xl border font-extrabold text-slate-50 hover:bg-blue-800/30 transition"
              >
                View Details
              </Link>
              <Link
                to="/events"
                className="px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-500 transition"
              >
                Back to Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="app-card p-7 text-slate-50">
            <h2 className="text-2xl font-extrabold text-center">
              Event Registration
            </h2>

            <div className="contact-underline mx-auto mt-2" />

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="app-card p-5 text-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="join-subcardLabel text-slate-50">
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
                    <label className="join-subcardLabel text-slate-50">
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
                    <label className="join-subcardLabel text-slate-50">
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
                    <label className="join-subcardLabel text-slate-50">
                      Phone (WhatsApp) *
                    </label>
                    <input
                      className={inputClass}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="join-subcardLabel text-slate-50">
                      Institution Name / Freelancer *
                    </label>
                    <input
                      className={inputClass}
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  {categories.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="join-subcardLabel text-slate-50">
                        Category *
                      </label>
                      <select
                        className={inputClass}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={submitting}
                      >
                        <option value="">Select category</option>
                        {categories.map((categoryItem) => (
                          <option key={categoryItem} value={categoryItem}>
                            {categoryItem}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <label className="join-subcardLabel flex items-center gap-2 text-slate-50">
                        <ImageIcon size={16} />
                        Submit Photos * (1 Required, Max 5)
                      </label>

                      <button
                        type="button"
                        onClick={addPhotoBox}
                        disabled={submitting || photos.length >= 5}
                        className="app-card px-4 py-2 bg-[#0B213E] text-white border-2 border-blue-400/35 font-extrabold hover:bg-blue-700/30 transition disabled:opacity-50"
                      >
                        + Add Photo
                      </button>
                    </div>

                    <div className="space-y-4">
                      {photos.map((photo, index) => (
                        <div
                          key={index}
                          className="app-card p-4 border-2 border-blue-400/25 bg-[#0B213E] text-slate-50"
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
                              placeholder="Photo title * (Required)"
                              value={photo.title}
                              onChange={(e) =>
                                updatePhotoField(index, "title", e.target.value)
                              }
                              disabled={submitting}
                            />

                            <textarea
                              className="contact-input w-full min-h-[90px] bg-[#0B213E] border-2 border-blue-400/35 rounded-xl px-4 py-3 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 outline-none text-slate-50"
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
                                {photo.file || photo.fileData
                                  ? `Selected: ${photo.fileName || photo.file?.name}`
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

              <div className="app-card p-5 border-2 border-blue-400/25 shadow-md bg-[#0B213E] text-slate-50">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full app-card p-4 bg-[#0B213E] text-white border-2 border-blue-400/35 font-extrabold flex items-center justify-center gap-2 hover:bg-blue-700/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  <span>
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </span>
                </button>

                <p className="mt-3 text-sm text-slate-300 text-center">
                  You will see the agreement before final submission.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {showRulesPopup && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card w-full max-w-2xl p-6 text-slate-50">
            <div className="flex items-center gap-3">
              <div className="contact-badge">
                <FileSignature size={18} />
              </div>
              <div className="text-xl font-extrabold">
                Submission Agreement
              </div>
            </div>

            <div className="mt-4 app-card p-5 max-h-[50vh] overflow-y-auto text-slate-50">
              <div className="font-bold mb-2">General Rules</div>
              <ul className="list-disc pl-6 text-slate-300 space-y-1">
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
                <span className="font-bold text-slate-50">
                  I accept the agreement and terms
                </span>
              </label>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!agreementAccepted || submitting}
                className="app-card flex-1 p-3 bg-[#0B213E] text-white border-2 border-blue-400/35 font-extrabold hover:bg-blue-700/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Submit
              </button>

              <button
                type="button"
                onClick={() => setShowRulesPopup(false)}
                className="app-card flex-1 p-3 font-bold text-slate-50 hover:bg-blue-800/30 transition"
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
