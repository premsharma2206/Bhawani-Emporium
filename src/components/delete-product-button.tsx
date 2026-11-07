"use client";

import { useState } from "react";
import { deleteProduct } from "@/actions/admin";
import { SubmitButton } from "@/components/form";

/** Delete button that asks for confirmation in place before removing the product for good. */
export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }
  return (
    <form action={deleteProduct} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-danger">Delete “{name}” for good? This cannot be undone.</span>
      <SubmitButton className="btn btn-danger">Yes, delete</SubmitButton>
      <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </form>
  );
}
