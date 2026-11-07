"use client";

import Link from "next/link";
import { type ChangeEvent, useActionState, useState } from "react";
import { saveProduct } from "@/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { MAX_PHOTO_SIDE, RESIZE_ABOVE_BYTES, fitWithin } from "@/lib/resize";

/**
 * Re-encodes a large photo as a JPEG no bigger than MAX_PHOTO_SIDE on its longest side, so
 * phone photos fit the upload limit. Returns the original file when it is already small.
 */
async function shrinkPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const fits = bitmap.width <= MAX_PHOTO_SIDE && bitmap.height <= MAX_PHOTO_SIDE;
  if (fits && file.size <= RESIZE_ABOVE_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  // JPEG has no transparency, so transparent PNG areas become white rather than black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function ProductForm({
  product,
}: {
  product?: {
    id: number;
    name: string;
    description: string;
    price: string;
    productType: string;
    tags: string;
    imageUrl: string | null;
  };
}) {
  const [state, action] = useActionState(saveProduct, undefined);
  const imageErrors = state?.errors?.image;
  const [photoNote, setPhotoNote] = useState("");
  const [shrinking, setShrinking] = useState(false);

  async function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    setPhotoNote("");
    if (!file) return;
    setShrinking(true);
    try {
      const small = await shrinkPhoto(file);
      if (small !== file) {
        const files = new DataTransfer();
        files.items.add(small);
        input.files = files.files;
        const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
        setPhotoNote(`Photo shrunk from ${mb(file.size)} MB to ${mb(small.size)} MB.`);
      }
    } catch {
      // The browser could not read the photo; upload it as it is and let the server check it.
    } finally {
      setShrinking(false);
    }
  }
  return (
    <form action={action} className="max-w-xl space-y-3">
      {product && <input type="hidden" name="id" value={product.id} />}
      <Field label="Name" name="name" defaultValue={product?.name} state={state} required />
      <Field
        label="Description"
        name="description"
        textarea
        defaultValue={product?.description}
        state={state}
      />
      <Field
        label="Price (₹)"
        name="price"
        inputMode="decimal"
        placeholder="499"
        defaultValue={product?.price}
        state={state}
        required
      />
      <Field
        label="Product type"
        name="productType"
        hint="Shown as a filter on the products page, for example Brassware."
        defaultValue={product?.productType}
        state={state}
      />
      <Field label="Tags" name="tags" defaultValue={product?.tags} state={state} />
      <div>
        <label htmlFor="image" className="mb-1 block text-sm font-medium">
          Photo
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block text-sm"
          onChange={onPhotoChange}
        />
        <p className="mt-1 text-xs text-muted">
          JPEG, PNG or WebP. Large photos are shrunk before upload.
          {product?.imageUrl ? " Leave empty to keep the current photo." : ""}
        </p>
        {shrinking && <p className="mt-1 text-xs text-muted">Shrinking photo…</p>}
        {photoNote && <p className="mt-1 text-xs text-success">{photoNote}</p>}
        {imageErrors && <p className="mt-1 text-sm text-danger">{imageErrors.join(" ")}</p>}
      </div>
      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton disabled={shrinking}>{product ? "Save changes" : "Add product"}</SubmitButton>
        <Link href="/admin" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
