import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, Eye, HelpCircle, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { ExtractedColor } from "../types";
import { getContrastColor, hslToHex, hexToRgb, rgbToHsl } from "../utils/colorUtils";

interface ColorSidebarProps {
  color: ExtractedColor;
  onColorSelect: (color: ExtractedColor) => void;
}

// Calculate relative luminance for WCAG contrast ratio
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate WCAG contrast ratio
function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Format contrast rating
function getContrastRating(ratio: number): { text: string; bgClass: string; textClass: string } {
  if (ratio >= 7) {
    return { text: "AAA (Excellent)", bgClass: "bg-emerald-50 border-emerald-100", textClass: "text-emerald-700" };
  } else if (ratio >= 4.5) {
    return { text: "AA (Pass)", bgClass: "bg-emerald-50/50 border-emerald-100/50", textClass: "text-emerald-600" };
  } else if (ratio >= 3) {
    return { text: "AA Large (Large Text Only)", bgClass: "bg-amber-50 border-amber-100", textClass: "text-amber-700" };
  } else {
    return { text: "Fail (Poor Contrast)", bgClass: "bg-rose-50 border-rose-100", textClass: "text-rose-700" };
  }
}

export default function ColorSidebar({ color, onColorSelect }: ColorSidebarProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const { hex, rgb, hsl } = color;

  // Format representations
  const formats = [
    { label: "Hex Code", value: hex, raw: hex },
    { label: "RGB Values", value: `${rgb.r}, ${rgb.g}, ${rgb.b}`, raw: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL Values", value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, raw: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  const handleCopy = (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedFormat(label);
        setTimeout(() => setCopiedFormat(null), 1500);
      } else {
        // Legacy textarea fallback for restricted iframe environments
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          setCopiedFormat(label);
          setTimeout(() => setCopiedFormat(null), 1500);
        }
      }
    } catch (err) {
      console.warn("Clipboard fallback copy failed:", err);
    }
  };

  // Calculate accessibility details
  const colorLum = getLuminance(rgb.r, rgb.g, rgb.b);
  const whiteLum = 1.0;
  const blackLum = 0.0;

  const contrastWithWhite = getContrastRatio(colorLum, whiteLum);
  const contrastWithBlack = getContrastRatio(colorLum, blackLum);

  const whiteRating = getContrastRating(contrastWithWhite);
  const blackRating = getContrastRating(contrastWithBlack);

  // Generate Harmonious Colors based on HSL
  const generateHarmonies = () => {
    const { h, s, l } = hsl;

    const complementary = {
      name: "Complementary",
      colors: [hslToHex((h + 180) % 360, s, l)],
      description: "Direct opposite on color wheel",
    };

    const analogous = {
      name: "Analogous",
      colors: [hslToHex((h - 30 + 360) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)],
      description: "Adjacent shades, calming",
    };

    const triadic = {
      name: "Triadic",
      colors: [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
      description: "Three vibrant equidistant hues",
    };

    const monochromatic = {
      name: "Monochromatic",
      colors: [
        hslToHex(h, Math.max(0, s - 10), Math.max(15, l - 25)),
        hslToHex(h, s, Math.max(10, l - 12)),
        hex,
        hslToHex(h, s, Math.min(90, l + 12)),
        hslToHex(h, Math.max(0, s - 10), Math.min(95, l + 25)),
      ],
      description: "Lightness variations",
    };

    return [complementary, analogous, triadic, monochromatic];
  };

  const harmonies = generateHarmonies();

  const handleHarmonySelect = (selectedHex: string, schemeName: string) => {
    const cleanHex = selectedHex.toUpperCase();
    const rgbVal = hexToRgb(cleanHex);
    const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);

    onColorSelect({
      id: `harmony-${cleanHex}`,
      hex: cleanHex,
      rgb: rgbVal,
      hsl: hslVal,
      percentage: color.percentage, // carry over context percentage
      xPercent: color.xPercent, // keep original coordinates for overlay
      yPercent: color.yPercent,
      label: `${schemeName} variation`,
    });
  };

  return (
    <div id="color-sidebar-section" className="bg-white border border-[#eeeeee] rounded-lg p-8 shadow-xs flex flex-col gap-6 w-full lg:sticky lg:top-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#999]">
          Active Inspector
        </h2>
        <span className="text-[9px] font-bold font-mono text-[#666] bg-[#f0f0f0] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {color.label}
        </span>
      </div>

      {/* Large Color Swatch Box */}
      <div
        className="w-full aspect-square rounded-xl shadow-inner border border-[#f0f0f0] flex flex-col items-center justify-center p-4 transition-all duration-300 relative overflow-hidden group"
        style={{ backgroundColor: hex }}
      >
        <span 
          className="font-mono font-bold text-lg uppercase tracking-wider mix-blend-difference filter invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          style={{ color: '#fff' }}
        >
          {hex}
        </span>
      </div>

      {/* Copy Code Fields */}
      <div className="flex flex-col gap-5">
        {formats.map((format) => (
          <div
            key={format.label}
            className="flex flex-col"
          >
            <label className="block text-[10px] font-bold text-[#bbb] uppercase mb-1 tracking-wider font-mono">
              {format.label}
            </label>
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2 text-sm font-mono text-[#333]">
              <span className="font-semibold">{format.value}</span>
              <button
                onClick={() => handleCopy(format.raw, format.label)}
                className="p-1 hover:bg-[#f9f9f9] rounded-md text-[#ccc] hover:text-[#333] transition-colors cursor-pointer"
                title={`Copy ${format.label}`}
              >
                <AnimatePresence mode="wait">
                  {copiedFormat === format.label ? (
                    <motion.span
                      key="checked"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility Contrast Analyzer Card */}
      <div className="flex flex-col gap-3 border-t border-[#eeeeee] pt-5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#999] uppercase tracking-widest font-display">
          <Eye className="w-3.5 h-3.5" />
          <span>Contrast analysis (WCAG)</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* White text */}
          <div className={`p-3 rounded-lg border flex flex-col gap-1 ${whiteRating.bgClass}`}>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">White Text</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-extrabold ${whiteRating.textClass}`}>
                {contrastWithWhite.toFixed(1)}:1
              </span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${whiteRating.textClass}`}>
              {whiteRating.text.split(" ")[0]}
            </span>
          </div>

          {/* Black text */}
          <div className={`p-3 rounded-lg border flex flex-col gap-1 ${blackRating.bgClass}`}>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Black Text</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-extrabold ${blackRating.textClass}`}>
                {contrastWithBlack.toFixed(1)}:1
              </span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${blackRating.textClass}`}>
              {blackRating.text.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Harmony Generator Schemes */}
      <div className="flex flex-col gap-4 border-t border-[#eeeeee] pt-5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#999] uppercase tracking-widest font-display">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Harmonies & schemes</span>
        </div>

        <div className="flex flex-col gap-3.5">
          {harmonies.map((scheme) => (
            <div key={scheme.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">{scheme.name}</span>
                <span className="text-[9px] text-zinc-400 font-mono">{scheme.description}</span>
              </div>

              {/* Swatch array representing harmony colors */}
              <div className="flex items-center h-7 rounded overflow-hidden border border-[#eeeeee]">
                {scheme.colors.map((harmHex, idx) => {
                  const isActive = hex === harmHex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleHarmonySelect(harmHex, scheme.name)}
                      className="flex-1 h-full relative cursor-pointer group transition-all hover:scale-y-110"
                      style={{ backgroundColor: harmHex }}
                      title={`Inspect ${harmHex}`}
                    >
                      {/* Highlight active hue indicator */}
                      {isActive && (
                        <div className="absolute inset-0 border border-black/30 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-white shadow-xs"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
