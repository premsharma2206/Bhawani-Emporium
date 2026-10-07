"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProduct } from "@/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/form";

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
  return (
    <form action={action} className="max-w-xl space-y-4">
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
        />
        <p className="mt-1 text-xs text-muted">
          JPEG, PNG or WebP, up to 5 MB.
          {product?.imageUrl ? " Leave empty to keep the current photo." : ""}
        </p>
        {imageErrors && <p className="mt-1 text-sm text-danger">{imageErrors.join(" ")}</p>}
      </div>
      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton>{product ? "Save changes" : "Add product"}</SubmitButton>
        <Link href="/admin" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
