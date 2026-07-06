import React, { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ImageMetadata } from "../types";

interface ImageUploaderProps {
  onImageSelected: (metadata: ImageMetadata) => void;
}

// Dynamic Client-side Canvas Art Generation Function
function createLocalPresetImage(type: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (type === "cyberpunk") {
    // Cyberpunk Neon Horizon
    const gradBg = ctx.createLinearGradient(0, 0, 0, 450);
    gradBg.addColorStop(0, "#090115");
    gradBg.addColorStop(0.5, "#16002c");
    gradBg.addColorStop(1, "#03000a");
    ctx.fillStyle = gradBg;
    ctx.fillRect(0, 0, 800, 450);

    // Glowing synthwave sun
    const sunGrad = ctx.createRadialGradient(400, 240, 10, 400, 240, 140);
    sunGrad.addColorStop(0, "#ff007f");
    sunGrad.addColorStop(0.4, "#9d00ff");
    sunGrad.addColorStop(1, "rgba(22, 0, 44, 0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(400, 240, 140, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal scanlines/cuts over the sun
    ctx.fillStyle = "#090115";
    for (let y = 160; y < 330; y += 14) {
      const h = (y - 160) / 12 + 3;
      ctx.fillRect(250, y, 300, h);
    }

    // Perspective Cyber Grid Lines
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    const horizon = 250;
    for (let x = -200; x <= 1000; x += 100) {
      ctx.beginPath();
      ctx.moveTo(400, horizon);
      ctx.lineTo(x, 450);
      ctx.stroke();
    }
    for (let y = horizon; y <= 450; y += 15) {
      const ratio = (y - horizon) / (450 - horizon);
      const py = horizon + Math.pow(ratio, 1.6) * (450 - horizon);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(800, py);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Futuristic Monolithic Towers
    ctx.fillStyle = "#0a0112";
    ctx.strokeStyle = "#ff007f";
    ctx.lineWidth = 2;
    // Left Monolith
    ctx.fillRect(120, 110, 70, 200);
    ctx.strokeRect(120, 110, 70, 200);
    // Right Monolith
    ctx.fillStyle = "#07000d";
    ctx.strokeStyle = "#00ffcc";
    ctx.fillRect(610, 130, 80, 180);
    ctx.strokeRect(610, 130, 80, 180);
    // Center Tall Spire
    ctx.fillStyle = "#040008";
    ctx.strokeStyle = "#ff00ff";
    ctx.fillRect(290, 70, 55, 250);
    ctx.strokeRect(290, 70, 55, 250);

    // Glowing Neon Orbs
    ctx.fillStyle = "#ff007f";
    ctx.beginPath();
    ctx.arc(155, 140, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(317, 100, 5, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === "sunset") {
    // Warm Desert Sunset
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 450);
    skyGrad.addColorStop(0, "#191143");
    skyGrad.addColorStop(0.35, "#5b1952");
    skyGrad.addColorStop(0.65, "#b5355c");
    skyGrad.addColorStop(0.88, "#ed815b");
    skyGrad.addColorStop(1, "#f7eb65");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 800, 450);

    // Glowing bright white/golden sun
    ctx.fillStyle = "#fffae8";
    ctx.shadowColor = "#f79d1e";
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(480, 220, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow effects

    // Rolling desert dunes layer 1 (Background dark magenta)
    ctx.fillStyle = "#831f55";
    ctx.beginPath();
    ctx.moveTo(0, 310);
    ctx.bezierCurveTo(220, 270, 440, 350, 800, 290);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

    // Dune layer 2 (Middle rich terracotta)
    ctx.fillStyle = "#b5355c";
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.bezierCurveTo(280, 410, 480, 290, 800, 340);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

    // Dune layer 3 (Foreground warm sunset orange)
    ctx.fillStyle = "#e0455d";
    ctx.beginPath();
    ctx.moveTo(0, 395);
    ctx.bezierCurveTo(240, 355, 540, 430, 800, 380);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

    // Foreground dark silhouette dune (Deep burgundy)
    ctx.fillStyle = "#270428";
    ctx.beginPath();
    ctx.moveTo(0, 450);
    ctx.bezierCurveTo(380, 420, 620, 450, 800, 425);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

  } else if (type === "botanical") {
    // Deep Botanical Greenery
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 450);
    bgGrad.addColorStop(0, "#051811");
    bgGrad.addColorStop(0.5, "#133827");
    bgGrad.addColorStop(1, "#0a2214");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 450);

    // Warm soft ambient lighting ray
    const sunbeam = ctx.createRadialGradient(720, 40, 30, 720, 40, 350);
    sunbeam.addColorStop(0, "rgba(245, 240, 215, 0.22)");
    sunbeam.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = sunbeam;
    ctx.fillRect(0, 0, 800, 450);

    // Dynamic Leaf drawer
    const drawDynamicLeaf = (cx: number, cy: number, size: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.45, -size * 0.35, size, 0);
      ctx.quadraticCurveTo(size * 0.45, size * 0.35, 0, 0);
      ctx.closePath();
      ctx.fill();

      // Vein highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();

      ctx.restore();
    };

    // Deep backdrop leaves
    drawDynamicLeaf(80, 360, 260, -40, "#0e2d1d");
    drawDynamicLeaf(180, 410, 300, -70, "#082012");
    drawDynamicLeaf(630, 390, 250, -115, "#154232");

    // Medium layers (emerald & rich moss)
    drawDynamicLeaf(130, 230, 230, -10, "#255c41");
    drawDynamicLeaf(430, 400, 275, -85, "#38805f");
    drawDynamicLeaf(560, 270, 210, -140, "#133a28");

    // Foreground bright leaves (Mint & soft sage)
    drawDynamicLeaf(-10, 160, 190, 15, "#4cb17f");
    drawDynamicLeaf(280, 310, 240, -55, "#6bc295");
    drawDynamicLeaf(700, 190, 170, -155, "#8cd1aa");
    drawDynamicLeaf(380, 190, 140, -25, "#255c41");

    // Subtle stems
    ctx.strokeStyle = "#aee0c3";
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(80, 450);
    ctx.bezierCurveTo(140, 360, 240, 310, 340, 290);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

  } else if (type === "minimalist") {
    // Minimalist Pastel Architecture
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 450);
    wallGrad.addColorStop(0, "#f8f4ed");
    wallGrad.addColorStop(1, "#f1e9dd");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, 800, 450);

    // Soft drop shadow ellipse
    ctx.fillStyle = "rgba(40, 25, 10, 0.04)";
    ctx.beginPath();
    ctx.ellipse(400, 345, 290, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Terracotta clay round arch
    ctx.fillStyle = "#de7559";
    ctx.beginPath();
    ctx.arc(400, 225, 120, Math.PI, 0, false);
    ctx.lineTo(520, 345);
    ctx.lineTo(280, 345);
    ctx.closePath();
    ctx.fill();

    // Clean column shadow
    ctx.fillStyle = "rgba(40, 25, 10, 0.07)";
    ctx.fillRect(515, 185, 95, 160);

    // Warm sand sandstone column
    ctx.fillStyle = "#f3eee0";
    ctx.fillRect(495, 185, 95, 160);
    ctx.fillStyle = "rgba(0, 0, 0, 0.035)";
    ctx.fillRect(570, 185, 20, 160);

    // 3D Peach-Blush Sphere
    const ballGrad = ctx.createRadialGradient(285, 245, 10, 305, 265, 55);
    ballGrad.addColorStop(0, "#fac0b2");
    ballGrad.addColorStop(0.65, "#f29c5c");
    ballGrad.addColorStop(1, "#e3694d");
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(305, 265, 55, 0, Math.PI * 2);
    ctx.fill();

    // Front structural step blocks
    ctx.fillStyle = "#7db097";
    ctx.fillRect(200, 345, 400, 38);
    ctx.fillStyle = "#3b557b";
    ctx.fillRect(250, 383, 300, 38);

    // Ambient direct sunlight shadow overlay
    ctx.fillStyle = "rgba(40, 25, 10, 0.035)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(160, 0);
    ctx.lineTo(560, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sampleImages, setSampleImages] = useState<{ name: string; url: string; description: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate gorgeous, high-resolution custom art presets locally on component mount
    setSampleImages([
      {
        name: "Neon Cyberpunk Horizon",
        url: createLocalPresetImage("cyberpunk"),
        description: "Vibrant electric pinks, violet glows, and cyan grids."
      },
      {
        name: "Desert Sunset Dunes",
        url: createLocalPresetImage("sunset"),
        description: "Warm terracotta pinks, glowing gold, and indigo twilight."
      },
      {
        name: "Tropical Botanical Leaves",
        url: createLocalPresetImage("botanical"),
        description: "Deep emerald greens, mint shades, and organic forest tones."
      },
      {
        name: "Minimalist Pastel Shapes",
        url: createLocalPresetImage("minimalist"),
        description: "Terracotta archways, warm sandstone sand, and peach spheres."
      }
    ]);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    setIsLoading(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      onImageSelected({
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type,
        url,
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      alert("Failed to load image. Try another file.");
      setIsLoading(false);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const loadPreset = (presetUrl: string, name: string) => {
    setIsLoading(true);
    const img = new Image();
    // Since it's a base64 local URL, no crossOrigin attribute is needed
    img.src = presetUrl;
    img.onload = () => {
      onImageSelected({
        name,
        size: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: "image/jpeg",
        url: presetUrl,
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      alert("Failed to load sample image.");
      setIsLoading(false);
    };
  };

  return (
    <div id="image-uploader-section" className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* Upload Drag & Drop Area */}
      <div
        id="drag-drop-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded p-10 cursor-pointer transition-all duration-300 min-h-[300px] text-center ${
          isDragging
            ? "border-black bg-[#f9f9f9]"
            : "border-[#eeeeee] bg-white hover:border-[#cccccc] hover:bg-[#fafafa]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-6 h-6 border-2 border-[#eeeeee] border-t-black rounded-full animate-spin"></div>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#999]">Processing image data...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-3.5 bg-zinc-50 rounded border border-[#eeeeee] text-zinc-500 transition-transform duration-300 group-hover:scale-105">
              <Upload className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider font-display">
                Drag and drop your image here
              </p>
              <p className="text-[11px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                JPEG, PNG, WEBP up to 15MB
              </p>
            </div>
            <div className="mt-2 px-5 py-2.5 bg-black hover:bg-black/95 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-xs transition-colors">
              Browse Files
            </div>
          </div>
        )}
      </div>

      {/* Preset/Sample Images Section */}
      <div id="samples-section" className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <h3 className="text-[10px] font-extrabold text-[#999] uppercase tracking-widest font-display">
            Or select a premium local preset (Zero APIs)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sampleImages.map((sample, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={(e) => {
                e.stopPropagation();
                loadPreset(sample.url, sample.name);
              }}
              className="group flex flex-col items-left bg-white border border-[#eeeeee] rounded p-2.5 text-left hover:border-[#cccccc] transition-all cursor-pointer"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xs bg-zinc-100 mb-2.5">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <h4 className="text-[11px] font-bold text-[#1a1a1a] uppercase tracking-wider line-clamp-1">{sample.name}</h4>
              <p className="text-[10px] text-zinc-400 mt-1 leading-normal line-clamp-2">
                {sample.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

