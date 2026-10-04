import { readFile } from "node:fs/promises";
import path from "node:path";
import { type ImageExt, contentTypeFor, uploadDir } from "@/lib/images";

// Serves images stored on disk when Cloudinary is not configured.
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = /^[0-9a-f-]{36}\.(jpg|png|webp)$/.exec(name);
  if (!match) return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(path.join(uploadDir(), name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentTypeFor(match[1] as ImageExt),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
