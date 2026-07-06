import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, Trash2, HelpCircle, Info, Sparkles, Upload } from "lucide-react";
import { ImageMetadata, ExtractedColor } from "./types";
import { extractPaletteFromImage } from "./utils/colorUtils";
import ImageUploader from "./components/ImageUploader";
import ImageViewer from "./components/ImageViewer";
import PaletteBar from "./components/PaletteBar";
import ColorSidebar from "./components/ColorSidebar";

export default function App() {
  const [image, setImage] = useState<ImageMetadata | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<ExtractedColor | null>(null);
  const [colorCount, setColorCount] = useState<number>(6);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // When image or desired color count changes, extract palette
  useEffect(() => {
    if (!image) {
      setColors([]);
      setSelectedColor(null);
      return;
    }

    const processImage = async () => {
      setIsProcessing(true);
      try {
        const imgElement = new Image();
        if (!image.url.startsWith("data:") && !image.url.startsWith("blob:")) {
          imgElement.crossOrigin = "anonymous";
        }
        imgElement.src = image.url;

        imgElement.onload = async () => {
          try {
            const palette = await extractPaletteFromImage(imgElement, colorCount);
            setColors(palette);
            if (palette.length > 0) {
              // Default to selecting the most dominant color
              setSelectedColor(palette[0]);
            }
          } catch (err) {
            console.error("Error inside image onload color extraction:", err);
          } finally {
            setIsProcessing(false);
          }
        };

        imgElement.onerror = () => {
          console.error("Could not load image element for color extraction.");
          setIsProcessing(false);
        };
      } catch (err) {
        console.error("Error processing palette extraction:", err);
        setIsProcessing(false);
      }
    };

    processImage();
  }, [image, colorCount]);

  const handleImageReset = () => {
    setImage(null);
    setColors([]);
    setSelectedColor(null);
  };

  // Called when user clicks a custom pixel in the ImageViewer
  const handlePixelSelect = (pixelData: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    xPercent: number;
    yPercent: number;
  }) => {
    const customColor: ExtractedColor = {
      id: "custom-picked",
      hex: pixelData.hex,
      rgb: pixelData.rgb,
      hsl: pixelData.hsl,
      percentage: 1, // small representative weight
      xPercent: pixelData.xPercent,
      yPercent: pixelData.yPercent,
      label: "Custom Inspected Pixel",
    };
    setSelectedColor(customColor);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] flex flex-col antialiased">
      {/* Top Professional Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#eeeeee] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500"></div>
            </div>
            <div className="flex items-baseline">
              <span className="font-semibold tracking-tight text-lg font-display">CHROMATICA</span>
              <span className="text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded-full text-[#666] ml-2.5 tracking-widest uppercase font-mono font-semibold">
                Pro
              </span>
            </div>
          </div>

          {/* Quick upload-new action button if image is loaded */}
          {image && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleImageReset}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded text-xs tracking-wider uppercase font-bold shadow-xs hover:bg-black/90 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 opacity-80" />
              <span>New Image</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 justify-center">
        <AnimatePresence mode="wait">
          {!image ? (
            // Phase 1 Upload Screen
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center py-6"
            >
              <ImageUploader onImageSelected={setImage} />
            </motion.div>
          ) : (
            // Main Color Extractor Sandbox Layout
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full"
            >
              {/* Left Sandbox column - Interactive image area & Palette (8/12 widths) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Visualizer Frame */}
                <div className="bg-white border border-[#eeeeee] rounded-lg p-6 shadow-xs flex flex-col gap-4">
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
                      <div className="w-6 h-6 border-2 border-[#eeeeee] border-t-black rounded-full animate-spin"></div>
                      <p className="text-xs tracking-wide uppercase font-semibold text-zinc-400">Extracting dominant colors...</p>
                    </div>
                  ) : (
                    <ImageViewer
                      image={image}
                      colors={colors}
                      selectedColor={selectedColor}
                      onColorSelect={setSelectedColor}
                      onPixelSelect={handlePixelSelect}
                    />
                  )}
                </div>

                {/* Dominant Palette Swatches Row */}
                {!isProcessing && colors.length > 0 && (
                  <PaletteBar
                    colors={colors}
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                    colorCount={colorCount}
                    onColorCountChange={setColorCount}
                  />
                )}
              </div>

              {/* Right Side Rail - Full Inspector (4/12 widths) */}
              <div className="lg:col-span-4 flex flex-col">
                <AnimatePresence mode="wait">
                  {selectedColor ? (
                    <motion.div
                      key={selectedColor.hex}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ColorSidebar
                        color={selectedColor}
                        onColorSelect={setSelectedColor}
                      />
                    </motion.div>
                  ) : (
                    <div className="bg-white border border-[#eeeeee] rounded-lg p-8 shadow-xs flex flex-col items-center justify-center text-center text-zinc-400 gap-3 min-h-[300px]">
                      <Info className="w-6 h-6 text-[#ccc]" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select a swatch or pixel to inspect.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern, Aesthetic Footnotes */}
      <footer className="bg-white border-t border-[#eeeeee] py-6 mt-auto text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <p className="text-[10px] text-[#999] uppercase tracking-widest font-bold">
            &copy; 2026 CHROMATICA PRO • K-Means Pixel Solver
          </p>
          <div className="flex items-center gap-4 text-[10px] text-[#999] uppercase tracking-widest font-bold">
            <span>Client-Side Safe</span>
            <span className="opacity-30">|</span>
            <span>WCAG 2.0 Contrast Analyzer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
