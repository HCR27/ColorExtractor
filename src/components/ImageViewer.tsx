import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExtractedColor, ImageMetadata } from "../types";
import { rgbToHex, rgbToHsl, getContrastColor } from "../utils/colorUtils";
import { Eye, Disc, Check, HelpCircle } from "lucide-react";

interface ImageViewerProps {
  image: ImageMetadata;
  colors: ExtractedColor[];
  selectedColor: ExtractedColor | null;
  onColorSelect: (color: ExtractedColor) => void;
  onPixelSelect: (pixelColor: { hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number }; xPercent: number; yPercent: number }) => void;
}

export default function ImageViewer({
  image,
  colors,
  selectedColor,
  onColorSelect,
  onPixelSelect,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imageSize, setImageSize] = useState({ displayWidth: 0, displayHeight: 0 });
  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, percentX: 0, percentY: 0 });
  const [showLoupe, setShowLoupe] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Initialize canvas offscreen when image URL changes
  useEffect(() => {
    if (!image.url) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      if (!image.url.startsWith("data:") && !image.url.startsWith("blob:")) {
        img.crossOrigin = "anonymous";
      }
      img.src = image.url;

      img.onload = () => {
        try {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvasRef.current = canvas;
          }
        } catch (canvasErr) {
          console.warn("Could not draw offscreen canvas:", canvasErr);
          canvasRef.current = null;
        }
      };

      img.onerror = (err) => {
        console.warn("Could not load image offscreen:", err);
        canvasRef.current = null;
      };
    } catch (e) {
      console.warn("Failed offscreen canvas initialization:", e);
      canvasRef.current = null;
    }
  }, [image.url]);

  // Handle resizing or display size detection
  const handleImageLoad = () => {
    updateDisplayDimensions();
  };

  useEffect(() => {
    const handleResize = () => {
      updateDisplayDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateDisplayDimensions = () => {
    if (imageRef.current) {
      setImageSize({
        displayWidth: imageRef.current.clientWidth,
        displayHeight: imageRef.current.clientHeight,
      });
    }
  };

  // Helper to extract pixel data from offscreen canvas
  const getPixelAtPosition = (percentX: number, percentY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(percentX * canvas.width)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(percentY * canvas.height)));

    try {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const r = pixelData[0];
      const g = pixelData[1];
      const b = pixelData[2];
      const a = pixelData[3];

      if (a === 0) return null; // transparent

      const hex = rgbToHex(r, g, b);
      return {
        hex,
        rgb: { r, g, b },
        hsl: rgbToHsl(r, g, b),
      };
    } catch (e) {
      console.error("Could not read canvas pixel (CORS restriction on remote image):", e);
      return null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(1, x / rect.width));
    const percentY = Math.max(0, Math.min(1, y / rect.height));

    // Get color under mouse cursor
    const pixelColor = getPixelAtPosition(percentX, percentY);
    if (pixelColor) {
      setHoverColor({
        hex: pixelColor.hex,
        rgb: `rgb(${pixelColor.rgb.r}, ${pixelColor.rgb.g}, ${pixelColor.rgb.b})`,
      });
      setHoverPosition({
        x,
        y,
        percentX,
        percentY,
      });
      setShowLoupe(true);
    } else {
      setShowLoupe(false);
    }
  };

  const handleMouseLeave = () => {
    setShowLoupe(false);
    setHoverColor(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    // Double check that we aren't clicking a color dot button directly
    if ((e.target as HTMLElement).closest(".color-dot-marker")) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(1, x / rect.width));
    const percentY = Math.max(0, Math.min(1, y / rect.height));

    const pixelColor = getPixelAtPosition(percentX, percentY);
    if (pixelColor) {
      onPixelSelect({
        ...pixelColor,
        xPercent: percentX,
        yPercent: percentY,
      });

      // Failsafe copy feedback
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pixelColor.hex);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        } else {
          // Legacy textarea fallback for restricted iframe environments
          const textArea = document.createElement("textarea");
          textArea.value = pixelColor.hex;
          // Avoid scrolling
          textArea.style.top = "0";
          textArea.style.left = "0";
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);
          if (successful) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1500);
          }
        }
      } catch (err) {
        console.warn("Clipboard fallback copy failed:", err);
      }
    }
  };

  return (
    <div id="image-viewer-container" className="flex flex-col items-center gap-4 w-full">
      {/* Dynamic Header Tooltip */}
      <div className="flex items-center gap-2 bg-zinc-50 border border-[#eeeeee] px-4 py-2 rounded text-[10px] text-[#666] shadow-xs uppercase tracking-wider font-mono font-bold">
        <Eye className="w-3.5 h-3.5 text-black" />
        <span>Click palette swatches or <strong>any pixel</strong> on image to inspect & copy</span>
      </div>

      <div
        ref={containerRef}
        className="relative select-none rounded-lg overflow-hidden border border-[#eeeeee] shadow-xs bg-[#f5f5f5] flex items-center justify-center max-h-[500px] w-full p-8"
      >
        {/* Interactive wrapper matching EXACT image dimensions */}
        <div
          id="image-interactive-viewport"
          className="relative cursor-crosshair inline-block max-h-[500px] shadow-lg rounded border border-[#eeeeee] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
        >
          <img
            ref={imageRef}
            src={image.url}
            alt={image.name}
            onLoad={handleImageLoad}
            className="object-contain max-h-[500px] w-auto max-w-full pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Color Dots Overlay */}
          {imageSize.displayWidth > 0 && (
            <div
              id="dots-overlay"
              className="absolute inset-0 pointer-events-auto"
              style={{
                width: imageSize.displayWidth,
                height: imageSize.displayHeight,
              }}
            >
              {colors.map((color, index) => {
                const isSelected = selectedColor?.id === color.id;
                const topPercent = `${color.yPercent * 100}%`;
                const leftPercent = `${color.xPercent * 100}%`;
                const fontContrastColor = getContrastColor(color.hex);

                return (
                  <motion.button
                    key={color.id}
                    className="color-dot-marker absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    style={{
                      top: topPercent,
                      left: leftPercent,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onColorSelect(color);
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.08 }}
                  >
                    {/* Ring Border with Color Core */}
                    <div
                      className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-black scale-110 shadow-lg ring-2 ring-white"
                          : "border-white shadow-md ring-1 ring-black/10 hover:ring-white/40"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {/* Number Inside Dot */}
                      <span
                        className="text-[9px] font-extrabold font-mono"
                        style={{ color: fontContrastColor }}
                      >
                        {index + 1}
                      </span>

                      {/* Custom Tooltip on Hover */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-30 font-mono font-bold tracking-wide uppercase border border-white/15">
                        {color.hex} • {color.percentage}%
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Custom Loupe / Floating Color Dropper UI */}
          <AnimatePresence>
            {showLoupe && hoverColor && (
              <motion.div
                className="absolute pointer-events-none z-40 hidden md:flex flex-col items-center"
                style={{
                  top: hoverPosition.y - 75,
                  left: hoverPosition.x,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.08 }}
              >
                {/* Loupe Circle */}
                <div className="relative w-14 h-14 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden bg-black/10">
                  {/* Grid Lines/Target Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-white/20 absolute"></div>
                    <div className="h-full w-[1px] bg-white/20 absolute"></div>
                    <div className="w-3 h-3 rounded-full border border-white/40 bg-transparent z-10"></div>
                  </div>

                  {/* Core Zoomed Color Block */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: hoverColor.hex }}
                  ></div>
                </div>

                {/* Color Hex Tag */}
                <div className="mt-2 bg-black/95 border border-white/10 text-[9px] font-mono font-bold tracking-wider text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hoverColor.hex }}></span>
                  <span>{hoverColor.hex}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* X, Y coordinates readout in bottom-left */}
        {showLoupe && (
          <div className="absolute bottom-6 left-6 flex gap-2 items-center bg-white/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#eeeeee] text-[10px] text-[#666] font-mono shadow-xs">
            <span>X: {Math.round(hoverPosition.percentX * (canvasRef.current?.width || 0))}px</span>
            <span className="opacity-30">|</span>
            <span>Y: {Math.round(hoverPosition.percentY * (canvasRef.current?.height || 0))}px</span>
            <span className="opacity-30">|</span>
            <span>RGB: {hoverColor?.rgb}</span>
          </div>
        )}
      </div>

      {/* Copy notification popup */}
      <AnimatePresence>
        {isCopied && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-mono border border-white/10"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied code!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
