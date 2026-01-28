 import { useEffect, useMemo, useState } from "react";
import {
  Send,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  IdCard,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CreditCard,
  Receipt,
  FileSignature,
  Facebook,
  BookOpen,
  Map,
  Trophy,
  Handshake,
  Users,
} from "lucide-react";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_JOIN_SCRIPT_URL;

export default function Login() {
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [submitMessage, setSubmitMessage] = useState("");

  const [photo, setPhoto] = useState(null);

  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(""); // cash|online|""
  const [receiverName, setReceiverName] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // ✅ auto hide pop-out after 5 sec
  useEffect(() => {
    if (!submitStatus) return;
    const t = setTimeout(() => {
      setSubmitStatus(null);
      setSubmitMessage("");
    }, 5000);
    return () => clearTimeout(t);
  }, [submitStatus]);

  const departments = useMemo(
    () => [
      "CSE",
      "EEE",
      "BBA",
      "Economics",
      "Data Science",
      "English",
      "Pharmacy",
      "Civil",
      "Others",
    ],
    []
  );

  const experienceLevels = useMemo(
    () => ["Beginner", "Intermediate", "Advanced", "Professional"],
    []
  );

  const photographyInterests = useMemo(
    () => [
      "Portrait Photography",
      "Landscape Photography",
      "Street Photography",
      "Wildlife Photography",
      "Sports Photography",
      "Event Photography",
      "Macro Photography",
      "Night Photography",
      "Architectural Photography",
      "Fashion Photography",
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        icon: BookOpen,
        title: "Workshops & Training",
        desc: "Learn & improve with structured sessions.",
      },
      {
        icon: Map,
        title: "Photo Walks & Events",
        desc: "Join themed walks and coverage events.",
      },
      {
        icon: Trophy,
        title: "Competitions",
        desc: "Showcase your best shots regularly.",
      },
      {
        icon: Handshake,
        title: "Networking",
        desc: "Meet and collaborate with creators.",
      },
      {
        icon: Camera,
        title: "Resources",
        desc: "Access learning resources and guidance.",
      },
      {
        icon: Users,
        title: "Community",
        desc: "Grow together in an active club culture.",
      },
    ],
    []
  );

  const [interests, setInterests] = useState([]);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }
    setPhoto(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setSubmitMessage("");
    setShowRulesPopup(true);
  };

  const resetForm = () => {
    [
      "ju_name",
      "ju_sid",
      "ju_email",
      "ju_phone",
      "ju_fb",
      "ju_msg",
      "ju_batch",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    const dept = document.getElementById("ju_dept");
    const exp = document.getElementById("ju_exp");
    if (dept) dept.value = "";
    if (exp) exp.value = "";

    const fileInput = document.getElementById("ju_photo");
    if (fileInput) fileInput.value = "";

    setPhoto(null);
    setInterests([]);
    setPaymentMethod("");
    setReceiverName("");
    setTransactionId("");
    setAgreementAccepted(false);
  };

  const handleFinalSubmit = async () => {
    if (!agreementAccepted) {
      alert("Please accept the membership agreement to continue.");
      return;
    }

    const name = document.getElementById("ju_name").value.trim();
    const studentId = document.getElementById("ju_sid").value.trim();
    const email = document.getElementById("ju_email").value.trim();
    const phone = document.getElementById("ju_phone").value.trim();
    const department = document.getElementById("ju_dept").value.trim();
    const batch = document.getElementById("ju_batch").value.trim();
    const facebookLink = document.getElementById("ju_fb").value.trim();
    const experience = document.getElementById("ju_exp").value.trim();
    const message = document.getElementById("ju_msg").value.trim();

    if (!GOOGLE_SCRIPT_URL) {
      setSubmitStatus("error");
      setSubmitMessage("Missing VITE_JOIN_SCRIPT_URL (env not set).");
      setShowRulesPopup(false);
      return;
    }

    if (!name || !studentId || !email || !department || !experience || !message) {
      setSubmitStatus("error");
      setSubmitMessage("Please fill all required fields (*).");
      setShowRulesPopup(false);
      return;
    }

    if (!paymentMethod) {
      setSubmitStatus("error");
      setSubmitMessage("Please select a payment method.");
      setShowRulesPopup(false);
      return;
    }

    if (paymentMethod === "cash" && !receiverName.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("Receiver name is required for cash payment.");
      setShowRulesPopup(false);
      return;
    }

    if (paymentMethod === "online" && !transactionId.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("Transaction ID is required for online payment.");
      setShowRulesPopup(false);
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");
    setShowRulesPopup(false);

    try {
      // optional: join status check
      try {
        const statusRes = await fetch(
          `${GOOGLE_SCRIPT_URL}?action=getJoinPageStatus`
        );
        const statusJson = await statusRes.json();
        if (statusJson?.data?.status !== "enabled") {
          setSubmitStatus("error");
          setSubmitMessage(
            "Membership applications are currently disabled. Please try later."
          );
          setSubmitting(false);
          return;
        }
      } catch {
        // ignore
      }

      let photoData = "";
      let photoName = "";
      let photoType = "";

      if (photo) {
        photoData = await convertToBase64(photo);
        photoName = photo.name;
        photoType = photo.type;
      }

      const body = new URLSearchParams();
      body.append("timestamp", new Date().toISOString());
      body.append("name", name);
      body.append("studentId", studentId);
      body.append("email", email);
      body.append("department", department);
      body.append("phone", phone);
      body.append("batch", batch);
      body.append("facebookLink", facebookLink);
      body.append("experience", experience);
      body.append("interests", interests.join(", "));
      body.append("message", message);
      body.append("paymentMethod", paymentMethod);
      body.append("receiverName", receiverName);
      body.append("transactionId", transactionId);
      body.append("agreementAccepted", "true");

      if (photoData) {
        body.append("photoData", photoData);
        body.append("photoName", photoName);
        body.append("photoType", photoType);
      }

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: body.toString(),
      });

      const json = await res.json();

      if (res.ok && json.status === "success") {
        setSubmitStatus("success");
        setSubmitMessage(
          `🎉 Welcome, ${name}!\nYour application has been submitted successfully.\nWe’ll contact you very soon.\n📸 DIUFPC Family`
        );
        resetForm();
      } else {
        setSubmitStatus("error");
        setSubmitMessage(json.message || "Submission failed.");
      }
    } catch {
      setSubmitStatus("error");
      setSubmitMessage("Network/server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      {/* ✅ CENTER POP-OUT (shows on current screen, auto hide 5s) */}
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

      <div className="max-w-4xl mx-auto space-y-10">
        {/* HERO */}
        <div className="app-card p-8 md:p-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
            Join DIUFPC
          </h1>
          <div className="contact-underline mx-auto mt-3" />
          <p className="mt-4 text-slate-700 max-w-3xl mx-auto">
            Become part of our creative community—workshops, photo walks,
            exhibitions, competitions and more.
          </p>
        </div>

        {/* BENEFITS */}
        <div className="app-card p-7">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center">
            Why Join Us?
          </h2>
          <div className="contact-underline mx-auto mt-2" />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, idx) => (
              <div key={idx} className="app-card p-5">
                <div className="flex items-start gap-3">
                  <div className="contact-badge">
                    <b.icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{b.title}</div>
                    <div className="text-sm text-slate-700 mt-1">{b.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="app-card p-7">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center">
            Membership Application
          </h2>
          <div className="contact-underline mx-auto mt-2" />

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="app-card p-5">
              <div className="text-lg font-bold text-slate-900 mb-3">
                Personal Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <User size={16} /> Full Name *
                  </label>
                  <input
                    id="ju_name"
                    className="contact-input w-full"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <IdCard size={16} /> Student ID *
                  </label>
                  <input
                    id="ju_sid"
                    className="contact-input w-full"
                    placeholder="Enter your student ID"
                  />
                </div>

                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Mail size={16} /> Email *
                  </label>
                  <input
                    id="ju_email"
                    className="contact-input w-full"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Phone size={16} /> Phone
                  </label>
                  <input
                    id="ju_phone"
                    className="contact-input w-full"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="join-subcard md:col-span-2">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Facebook size={16} /> Facebook Profile Link
                  </label>
                  <input
                    id="ju_fb"
                    className="contact-input w-full"
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Building2 size={16} /> Department *
                  </label>
                  <select id="ju_dept" className="contact-input w-full">
                    <option value="">Select your department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <GraduationCap size={16} /> Batch
                  </label>
                  <input
                    id="ju_batch"
                    className="contact-input w-full"
                    placeholder="e.g., D-76"
                  />
                </div>
              </div>
            </div>

            {/* Photography Background */}
            <div className="app-card p-5">
              <div className="text-lg font-bold text-slate-900 mb-3">
                Photography Background
              </div>

              <div className="space-y-4">
                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Camera size={16} /> Experience Level *
                  </label>
                  <select id="ju_exp" className="contact-input w-full">
                    <option value="">Select your experience level</option>
                    {experienceLevels.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Why Join */}
                <div className="join-subcard">
                  <label className="join-subcardLabel">
                    Why do you want to join DIUFPC? *
                  </label>
                  <textarea
                    id="ju_msg"
                    className="contact-input w-full min-h-[140px]"
                    placeholder="Tell us about your interest and goals..."
                  />
                </div>

                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Camera size={16} /> Photography Interests *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {photographyInterests.map((item) => (
                      <label
                        key={item}
                        className="app-card p-3 flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(item)}
                          onChange={() => toggleInterest(item)}
                        />
                        <span className="text-sm font-semibold text-slate-800">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Button */}
                <div className="join-subcard">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <ImageIcon size={16} /> Submit your Photo (Optional, max 5MB)
                  </label>

                  <div className="join-fileWrap">
                    <label className="join-fileBtn">
                      <ImageIcon size={18} />
                      Choose Photo
                      <input
                        id="ju_photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="join-fileHidden"
                        disabled={submitting}
                      />
                    </label>

                    <div className="join-fileMeta">
                      {photo ? (
                        <>
                          Selected:{" "}
                          <span className="font-extrabold">{photo.name}</span>
                        </>
                      ) : (
                        "No file selected"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="app-card p-5">
              <div className="text-lg font-bold text-slate-900 mb-3">
                Payment Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("cash");
                    setReceiverName("");
                    setTransactionId("");
                  }}
                  className={`app-card p-4 text-left transition ${
                    paymentMethod === "cash"
                      ? "border-blue-500/60"
                      : "hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Receipt size={18} /> Cash Payment
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    Pay to club executive and write receiver name.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("online");
                    setReceiverName("");
                    setTransactionId("");
                  }}
                  className={`app-card p-4 text-left transition ${
                    paymentMethod === "online"
                      ? "border-blue-500/60"
                      : "hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CreditCard size={18} /> Online Payment
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    Submit transaction ID after payment.
                  </div>
                </button>
              </div>

              {paymentMethod === "cash" && (
                <div className="join-subcard mt-4">
                  <label className="join-subcardLabel flex items-center gap-2">
                    <Receipt size={16} /> Receiver Name *
                  </label>
                  <input
                    className="contact-input w-full"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Name of the person who received payment"
                    disabled={submitting}
                  />
                </div>
              )}

              {paymentMethod === "online" && (
                <div className="join-subcard mt-4">
                  <div className="text-sm text-slate-700 mb-3">
                    (Replace these lines with DIUFPC payment details)
                    <br />• Method: bKash/Nagad/Bank
                    <br />• Amount: ___ BDT
                    <br />• Number: ___
                  </div>
                  <label className="join-subcardLabel flex items-center gap-2">
                    <CreditCard size={16} /> Transaction ID *
                  </label>
                  <input
                    className="contact-input w-full"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    disabled={submitting}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="app-card p-5">
              <button
                type="submit"
                disabled={submitting}
                className="contact-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                <span>{submitting ? "Submitting..." : "Submit Application"}</span>
              </button>
              <p className="mt-3 text-sm text-slate-600 text-center">
                You will see the membership agreement before final submission.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Rules & Agreement Popup */}
      {showRulesPopup && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card w-full max-w-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="contact-badge">
                <FileSignature size={18} />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                Membership Agreement & Code of Conduct
              </div>
            </div>

            <div className="mt-4 app-card p-5 max-h-[50vh] overflow-y-auto">
              <div className="text-slate-800 font-bold mb-2">General Rules</div>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Respect all members, executives, and participants.</li>
                <li>Maintain discipline and professionalism in activities.</li>
                <li>No misconduct/harassment; violations may lead to action.</li>
                <li>Participate and contribute to club growth.</li>
                <li>Club resources must be used for club purposes only.</li>
              </ul>

              <div className="text-slate-800 font-bold mt-5 mb-2">
                Participation Expectations
              </div>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Attend workshops/training sessions regularly.</li>
                <li>Join photo walks/events when possible.</li>
                <li>Contribute to club showcases and activities.</li>
                <li>Help in event management and community work.</li>
              </ul>

              <label className="mt-4 app-card p-4 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                />
                <span className="font-bold text-slate-900">
                  I accept the Membership Agreement & Code of Conduct
                </span>
              </label>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!agreementAccepted || submitting}
                className="contact-btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
