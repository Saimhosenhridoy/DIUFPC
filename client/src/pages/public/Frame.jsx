// src/pages/public/Frame.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload,
  Download,
  RotateCw,
  RefreshCw,
  ZoomOut,
  Image as ImageIcon,
  Move,
} from "lucide-react";
import { FRAMES } from "../../data/frames";

export default function Frame() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Match frame from URL path (/frame/:id) or default to the first frame
  const selectedFrame =
    FRAMES.find((f) => f.id === id) || FRAMES[0] || null;

  // Redirect /frame to /frame/:id automatically without any query marks
  useEffect(() => {
    if (!id && selectedFrame?.id) {
      navigate(`/frame/${selectedFrame.id}`, { replace: true });
    }
  }, [id, selectedFrame, navigate]);

  // Editor states
  const [userImage, setUserImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [frameImgObj, setFrameImgObj] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load the frame image overlay
  useEffect(() => {
    if (!selectedFrame?.frameUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedFrame.frameUrl;
    img.onload = () => setFrameImgObj(img);
    img.onerror = () => {
      setFrameImgObj(null);
    };
  }, [selectedFrame]);

  // Handle user photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Render photo and frame on the 1080x1080 canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 1080;

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background base
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // 1. Draw user photo
    if (userImage) {
      ctx.save();
      ctx.translate(size / 2 + position.x, size / 2 + position.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const hRatio = size / userImage.width;
      const vRatio = size / userImage.height;
      const baseScale = Math.max(hRatio, vRatio);

      const drawW = userImage.width * baseScale;
      const drawH = userImage.height * baseScale;

      ctx.drawImage(userImage, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 2. Draw frame overlay on top
    if (frameImgObj) {
      ctx.drawImage(frameImgObj, 0, 0, size, size);
    } else {
      // Fallback frame preview if PNG is not yet loaded
      ctx.strokeStyle = "#1378ff";
      ctx.lineWidth = 40;
      ctx.strokeRect(20, 20, size - 40, size - 40);

      ctx.fillStyle = "rgba(2, 9, 22, 0.9)";
      ctx.fillRect(40, size - 170, size - 80, 130);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(selectedFrame?.title || "DIUFPC Event", size / 2, size - 95);
    }
  }, [userImage, frameImgObj, zoom, position, rotation, selectedFrame]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (!userImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan handlers for mobile screens
  const handleTouchStart = (e) => {
    if (!userImage) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Export and download merged photo
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `${selectedFrame?.id || "diufpc"}-frame.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setIsDownloading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#020916] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300 text-xs font-bold tracking-wide">
            <img
              src="/diufpc.svg"
              alt="DIUFPC"
              className="w-4 h-4 rounded-full object-contain"
            />
            DIUFPC CAMPAIGN FRAME
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Create Your <span className="text-sky-400">Profile Frame</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">
            Upload your photo, adjust it to fit the campaign frame, and download high-resolution photos for social media.
          </p>
        </div>

        {/* Frame selector dropdown */}
        <div className="bg-[#06162e] border border-blue-400/25 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-xs uppercase font-extrabold text-blue-300 tracking-wider mb-1">
              Select Campaign / Event Frame
            </label>
            <div className="text-slate-200 text-sm font-semibold">
              {selectedFrame?.subtitle || "Choose an event frame"}
            </div>
          </div>

          <div className="w-full md:w-72">
            <select
              value={selectedFrame?.id}
              onChange={(e) => {
                navigate(`/frame/${e.target.value}`);
              }}
              className="w-full bg-[#102746] border border-blue-400/40 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
            >
              {FRAMES.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#06162e] text-white">
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Editor & Preview grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Canvas Preview column */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border-2 border-blue-400/30 bg-[#06162e] shadow-2xl cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />

              {!userImage && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-black/50 transition"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center mb-3">
                    <Upload className="w-8 h-8 text-sky-300" />
                  </div>
                  <div className="text-white font-bold text-base">
                    Click here to Upload Photo
                  </div>
                  <div className="text-slate-300 text-xs mt-1">
                    Supports PNG, JPG, or WEBP
                  </div>
                </div>
              )}
            </div>

            {userImage && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                <Move className="w-3.5 h-3.5 text-sky-400" />
                Drag to reposition photo
              </div>
            )}
          </div>

          {/* Controls & Action column */}
          <div className="lg:col-span-5 space-y-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg transition"
            >
              {userImage ? (
                <>
                  <ImageIcon className="w-4 h-4" /> Change Photo
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload Photo
                </>
              )}
            </button>

            {/* Adjustments */}
            <div className="bg-[#06162e] border border-blue-400/20 rounded-2xl p-5 space-y-4">
              <div className="text-sm font-bold text-slate-200">
                Adjust Your Photo
              </div>

              {/* Zoom */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <ZoomOut className="w-3.5 h-3.5" /> Zoom
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  disabled={!userImage}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Rotate and Reset */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={!userImage}
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="py-2 px-3 rounded-lg border border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <RotateCw className="w-3.5 h-3.5 text-sky-400" /> Rotate 90°
                </button>

                <button
                  type="button"
                  disabled={!userImage}
                  onClick={handleReset}
                  className="py-2 px-3 rounded-lg border border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> Reset
                </button>
              </div>
            </div>

            {/* Download button */}
            <button
              disabled={!userImage || isDownloading}
              onClick={handleDownload}
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? "Generating Image..." : "Download Framed Photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}