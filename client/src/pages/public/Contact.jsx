 import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Send,
} from "lucide-react";

export default function Contact() {
  const sendMessage = () => {
    const name = document.getElementById("name").value.trim();
    const dept = document.getElementById("dept").value.trim();
    const msg = document.getElementById("message").value.trim();

    if (!name || !msg) {
      alert("Please enter your name and message.");
      return;
    }

    const subject = `DIUFPC Contact Message — ${name}`;
    const body = `Name: ${name}
Department: ${dept || "N/A"}

Message:
${msg}`;

    const gmailURL =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=diufpc@gmail.com" +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailURL, "_blank");
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HERO */}
        <div className="app-card p-8 md:p-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-skyblue-600">
            Contact Us
          </h1>
          <div className="contact-underline mx-auto mt-3" />
          <p className="mt-4 text-slate-700">
            Get in touch with{" "}
            <a
              href="https://www.facebook.com/diufpc/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline underline-offset-4"
            >
              DIU Film & Photography Club
            </a>
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT */}
          <div className="flex flex-col gap-8">
            {/* Follow */}
            <div className="app-card p-7 flex-1">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  Follow Us
                </h2>
                <div className="contact-underline mx-auto mt-2" />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <a
                  href="https://www.facebook.com/diufpc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-tile"
                >
                  <div className="contact-tileIcon">
                    <Facebook size={26} className="text-[#1877F2]" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-800">
                    Facebook
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/diufpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-tile"
                >
                  <div className="contact-tileIcon">
                    <Instagram size={26} className="text-[#E4405F]" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-800">
                    Instagram
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/company/99019382/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-tile"
                >
                  <div className="contact-tileIcon">
                    <Linkedin size={26} className="text-[#0A66C2]" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-800">
                    LinkedIn
                  </div>
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="app-card p-7">
              <div className="flex gap-4 items-start">
                <div className="contact-badge">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    Email
                  </div>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=diufpc@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-slate-700 hover:underline underline-offset-4"
                  >
                    diufpc@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            <a
              href="https://maps.app.goo.gl/Wu9FtP6NPJ6mQcVt5"
              target="_blank"
              rel="noopener noreferrer"
              className="app-card p-7 block"
            >
              <div className="flex gap-4 items-start">
                <div className="contact-badge">
                  <MapPin size={20} />
                </div>
                <div className="text-slate-700">
                  <div className="text-lg font-bold text-slate-900">
                    Location
                  </div>
                  <div className="mt-2 leading-relaxed">
                    Dhaka International University <br />
                    Satarkul, Badda <br />
                    Dhaka 1212, Bangladesh
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* RIGHT — FORM */}
          <div className="app-card p-8 flex flex-col">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Send us a Message
              </h2>
              <div className="contact-underline mx-auto mt-2" />
            </div>

            <div className="mt-6 flex flex-col gap-5 flex-1">
              {/* Name */}
              <div className="app-card p-5 flex flex-col">
                <label className="text-sm font-bold text-slate-900 mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  className="contact-input w-full"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Department / Batch */}
              <div className="app-card p-5 flex flex-col">
                <label className="text-sm font-bold text-slate-900 mb-2">
                  Department / Batch
                </label>
                <input
                  id="dept"
                  className="contact-input w-full"
                  placeholder="Your department or batch (optional)"
                />
              </div>

              {/* Message */}
              <div className="app-card p-5 flex flex-col flex-1">
                <label className="text-sm font-bold text-slate-900 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  className="contact-input flex-1 w-full"
                  placeholder="Write your message here..."
                />
              </div>

              {/* Button */}
              <div className="app-card p-5">
                <button
                  type="button"
                  onClick={sendMessage}
                  className="contact-btn w-full flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  <span>SEND MESSAGE</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FIND US */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Find Us at
          </h2>
          <div className="contact-underline mx-auto mt-3" />
        </div>

        <div className="app-card p-10 text-center">
          <h3 className="mt-6 text-2xl md:text-3xl font-extrabold text-slate-900">
            <a
              href="https://diu.ac/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              Dhaka International University
            </a>
          </h3>
          <p className="mt-3 text-slate-700">
            Satarkul, Badda, Dhaka 1212, Bangladesh
          </p>
        </div>
      </div>
    </div>
  );
}
