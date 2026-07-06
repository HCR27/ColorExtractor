export interface ExtractedColor {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  // Position in the original full-size image (0 to 1 scale)
  xPercent: number;
  yPercent: number;
  // Label for the palette color
  label: string;
}

export interface ImageMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
  url: string;
}

export type ColorFormat = "hex" | "rgb" | "hsl";
