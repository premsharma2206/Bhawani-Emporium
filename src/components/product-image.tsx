import Image from "next/image";

export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl photo-well">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={priority}
          // Files served from the local upload folder skip the image optimizer.
          unoptimized={src.startsWith("/uploads/")}
          className="object-contain"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-stone-500">
          No photo
        </div>
      )}
    </div>
  );
}
