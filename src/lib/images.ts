import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
export type ImageExt = keyof typeof CONTENT_TYPES;

export function contentTypeFor(ext: ImageExt) {
  return CONTENT_TYPES[ext];
}

export function uploadDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || ".uploads");
}

/** Identifies the image type from its leading bytes, ignoring the filename. */
export function sniffImage(buf: Buffer): ImageExt | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from("\x89PNG\r\n\x1a\n", "latin1"))) {
    return "png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("latin1", 0, 4) === "RIFF" &&
    buf.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

/** Stores a product image and returns its URL. Throws if it is not a JPEG, PNG or WebP. */
export async function saveImage(buf: Buffer): Promise<string> {
  const ext = sniffImage(buf);
  if (!ext) throw new Error("Image must be a JPEG, PNG or WebP file.");
  if (buf.length > MAX_IMAGE_BYTES) throw new Error("Image must be 5 MB or smaller.");

  if (process.env.CLOUDINARY_URL) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "bhawani-emporium", resource_type: "image" }, (err, result) => {
          if (err || !result) reject(err ?? new Error("Image upload failed."));
          else resolve(result.secure_url);
        })
        .end(buf);
    });
  }

  const name = `${randomUUID()}.${ext}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), name), buf);
  return `/uploads/${name}`;
}
