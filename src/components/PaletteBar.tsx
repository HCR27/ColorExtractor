import React from "react";
import { motion } from "motion/react";
import { ExtractedColor } from "../types";
import { getContrastColor } from "../utils/colorUtils";
import { Layers, Sliders } from "lucide-react";

interface PaletteBarProps {
  colors: ExtractedColor[];
  selectedColor: ExtractedColor | null;
  onColorSelect: (color: ExtractedColor) => void;
  colorCount: number;
  onColorCountChange: (count: number) => void;
}

export default function PaletteBar({
  colors,
  selectedColor,
  onColorSelect,
  colorCount,
  onColorCountChange,
}: PaletteBarProps) {
  return (
    <div id="palette-bar-section" className="bg-white border border-[#eeeeee] rounded-lg p-6 shadow-xs flex flex-col gap-5 w-full">
      {/* Header and Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-50 rounded border border-[#eeeeee] text-[#666]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#1a1a1a] font-display text-xs uppercase tracking-wider">
              Extracted Palette
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Refined by mathematical density centroids
            </p>
          </div>
        </div>

        {/* Swatch count selector */}
        <div className="flex items-center gap-3 bg-white border border-[#eeeeee] px-3.5 py-1.5 rounded text-xs font-mono">
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500 font-medium">Count:</span>
          <div className="flex items-center gap-1">
            {[4, 6, 8, 10].map((num) => (
              <button
                key={num}
                onClick={() => onColorCountChange(num)}
                className={`px-2 py-0.5 rounded font-bold transition-all text-[11px] uppercase tracking-wider ${
                  colorCount === num
                    ? "bg-black text-white"
                    : "text-zinc-400 hover:text-black hover:bg-zinc-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette Swatches List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {colors.map((color, index) => {
          const isSelected = selectedColor?.id === color.id;
          const fontContrastColor = getContrastColor(color.hex);

          return (
            <motion.button
              key={color.id}
              onClick={() => onColorSelect(color)}
              className={`relative flex flex-col items-stretch overflow-hidden rounded border text-left p-1 transition-all cursor-pointer group ${
                isSelected
                  ? "border-black ring-2 ring-black/5 bg-zinc-50/50"
                  : "border-[#eeeeee] hover:border-[#cccccc] hover:bg-zinc-50 bg-white"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Colored Top Block */}
              <div
                className="h-14 w-full rounded-sm relative flex items-start justify-between p-1 shadow-inner"
                style={{ backgroundColor: color.hex }}
              >
                {/* Badge Number */}
                <span
                  className="text-[8px] font-extrabold px-1 py-0.5 rounded-sm bg-white/30 backdrop-blur-xs font-mono"
                  style={{ color: fontContrastColor }}
                >
                  {index + 1}
                </span>

                {/* Percentage Weight tag */}
                <span
                  className="text-[8px] font-extrabold px-1 py-0.5 rounded-sm bg-black/15 text-white backdrop-blur-xs font-mono"
                  style={{ color: fontContrastColor === "black" ? "rgba(0,0,0,0.7)" : "#fff" }}
                >
                  {color.percentage}%
                </span>
              </div>

              {/* Swatch Label/Metadata */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                  {color.label}
                </span>
                <span className="text-xs font-bold text-[#1a1a1a] font-mono leading-none mt-0.5">
                  {color.hex}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
