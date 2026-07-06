import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ImageMetadata } from "../types";

interface ImageUploaderProps {
  onImageSelected: (metadata: ImageMetadata) => void;
}

const SAMPLE_IMAGES = [
  {
    name: "Neon Cyberpunk Street",
    url: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=800&q=80",
    description: "Vibrant neon purples, blues, and electric pinks."
  },
  {
    name: "Desert Sunset Dunes",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    description: "Warm ochres, terracotta pinks, and twilight indigo."
  },
  {
    name: "Tropical Botanical Leaves",
    url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
    description: "Deep emerald greens, moss shades, and soft earthy tones."
  },
  {
    name: "Minimalist Pastel Architecture",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    description: "Soft peaches, light cream, and warm sandstone shadows."
  }
];

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Enable crossOrigin to read pixels from the remote unsplash server
    img.crossOrigin = "anonymous";
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
      alert("Failed to load sample image. Please try uploading your own instead!");
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
            Or select a premium sample preset
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_IMAGES.map((sample, idx) => (
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
