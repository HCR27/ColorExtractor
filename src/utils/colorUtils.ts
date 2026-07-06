import { ExtractedColor } from "../types";

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (num: number) => {
    const hex = clamp(num).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert HSL to HEX
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Get contrast text color (black or white) for a given hex color
export function getContrastColor(hex: string): "black" | "white" {
  const { r, g, b } = hexToRgb(hex);
  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

// Calculate Euclidean distance between two RGB colors
function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

// Interface for K-Means pixel structure
interface PixelInfo {
  r: number;
  g: number;
  b: number;
  xPercent: number;
  yPercent: number;
}

/**
 * Extracts a palette of K dominant colors from an HTMLImageElement using K-Means clustering.
 * Downsamples the image to a grid first to ensure high performance.
 */
export async function extractPaletteFromImage(
  img: HTMLImageElement,
  k: number = 6
): Promise<ExtractedColor[]> {
  return new Promise((resolve) => {
    try {
      // 1. Create a downsampled canvas (100x100 is plenty for accurate color analysis in milliseconds)
      const size = 120;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve([]);
        return;
      }

      // Draw image onto downsampled canvas
      ctx.drawImage(img, 0, 0, size, size);

      // Get pixel data
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      // 2. Parse pixels into array with relative coordinates
      const pixels: PixelInfo[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        // Skip transparent or near-transparent pixels
        if (a < 50) continue;

        const pixelIdx = i / 4;
        const x = pixelIdx % size;
        const y = Math.floor(pixelIdx / size);

        pixels.push({
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          xPercent: x / size,
          yPercent: y / size,
        });
      }

      if (pixels.length === 0) {
        resolve([]);
        return;
      }

      // 3. Initialize K Centroids
      // We space centroids across the list to get diverse initial seeds (similar to k-means++-like diversity)
      let centroids = Array.from({ length: k }, (_, idx) => {
        const step = Math.floor(pixels.length / k);
        const targetIdx = Math.max(0, Math.min(idx * step + Math.floor(step / 2), pixels.length - 1));
        const pixel = pixels[targetIdx] || pixels[0];
        return { r: pixel.r, g: pixel.g, b: pixel.b };
      });

      const maxIterations = 8;
      let assignments = new Int32Array(pixels.length);

      // 4. K-Means iterations
      for (let iter = 0; iter < maxIterations; iter++) {
        let changed = false;

        // Assign pixels to closest centroid
        for (let pIdx = 0; pIdx < pixels.length; pIdx++) {
          const pixel = pixels[pIdx];
          let minDist = Infinity;
          let closestIdx = 0;

          for (let cIdx = 0; cIdx < k; cIdx++) {
            const centroid = centroids[cIdx];
            if (!centroid) continue;
            const dist = colorDistance(pixel, centroid);
            if (dist < minDist) {
              minDist = dist;
              closestIdx = cIdx;
            }
          }

          if (assignments[pIdx] !== closestIdx) {
            assignments[pIdx] = closestIdx;
            changed = true;
          }
        }

        if (!changed && iter > 0) break; // Early exit if assignments stabilized

        // Recalculate centroids
        const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
        for (let pIdx = 0; pIdx < pixels.length; pIdx++) {
          const pixel = pixels[pIdx];
          const cIdx = assignments[pIdx];
          const sum = sums[cIdx];
          if (sum) {
            sum.r += pixel.r;
            sum.g += pixel.g;
            sum.b += pixel.b;
            sum.count++;
          }
        }

        for (let cIdx = 0; cIdx < k; cIdx++) {
          const sum = sums[cIdx];
          if (sum && sum.count > 0) {
            centroids[cIdx] = {
              r: Math.round(sum.r / sum.count),
              g: Math.round(sum.g / sum.count),
              b: Math.round(sum.b / sum.count),
            };
          }
        }
      }

      // 5. Finalize palette: calculate percentage and find representative pixel for each cluster
      // To support Phase 4: Find the actual pixel in our pixel grid that is closest to each final centroid
      const palette: ExtractedColor[] = centroids.map((centroid, cIdx) => {
        // Find representative pixel
        let minDistance = Infinity;
        let representativePixel = pixels[0];

        let count = 0;
        for (let pIdx = 0; pIdx < pixels.length; pIdx++) {
          const pixel = pixels[pIdx];
          if (assignments[pIdx] === cIdx) {
            count++;
            const dist = colorDistance(pixel, centroid);
            if (dist < minDistance) {
              minDistance = dist;
              representativePixel = pixel;
            }
          }
        }

        const hex = rgbToHex(centroid.r, centroid.g, centroid.b);
        const hsl = rgbToHsl(centroid.r, centroid.g, centroid.b);
        const percentage = Math.round((count / pixels.length) * 100);

        return {
          id: `color-${cIdx}`,
          hex,
          rgb: centroid,
          hsl,
          percentage,
          xPercent: representativePixel.xPercent,
          yPercent: representativePixel.yPercent,
          label: `Dominant ${cIdx + 1}`,
        };
      });

      // Sort by percentage weight descending
      palette.sort((a, b) => b.percentage - a.percentage);

      // Update labels after sorting to match dominance order
      palette.forEach((color, idx) => {
        color.label = idx === 0 ? "Dominant Color" : `Swatch ${idx + 1}`;
      });

      resolve(palette);
    } catch (err) {
      console.error("Failed to extract color palette due to canvas/CORS error:", err);
      resolve([]);
    }
  });
}
