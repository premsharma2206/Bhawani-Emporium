/** Longest side, in pixels, that product photos are scaled down to before upload. */
export const MAX_PHOTO_SIDE = 2000;

/** Photos smaller than this, and within MAX_PHOTO_SIDE, are uploaded as they are. */
export const RESIZE_ABOVE_BYTES = 1024 * 1024;

/** Scales width and height down to fit within max on the longest side, keeping the shape. */
export function fitWithin(width: number, height: number, max = MAX_PHOTO_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
