"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export function UploadProductImageForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess?: () => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!files || files.length === 0) {
      alert("Please choose image files");
      return;
    }

    try {
      setLoading(true);

      const token = getAdminToken();

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);

        await api.post(`/admin/products/${productId}/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      alert("Images uploaded successfully");
      setFiles(null);
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to upload images");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-zinc-50 p-4">
      <h3 className="mb-3 text-sm font-semibold">Upload Images</h3>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(e.target.files)}
        className="w-full rounded-xl border border-zinc-300 px-3 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-zinc-900 px-5 py-2 text-white"
      >
        {loading ? "Uploading..." : "Upload Images"}
      </button>
    </form>
  );
}
