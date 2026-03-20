"use client";

import { useRef, useState } from "react";
import { ImageIcon, RefreshCw, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import type { ToastState } from "@/components/ui/toast";

export function UploadProductImageForm({
  productId,
  onSuccess,
  onToast,
}: {
  productId: string;
  onSuccess?: () => void;
  onToast?: (toast: ToastState) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (files.length === 0) {
      onToast?.({ message: "Please select at least one image.", type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const token = getAdminToken();

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        await api.post(`/admin/products/${productId}/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      onToast?.({
        message: `${files.length} image${files.length > 1 ? "s" : ""} uploaded successfully.`,
        type: "success",
      });

      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      onToast?.({
        message: error?.response?.data?.message || "Failed to upload images.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center transition hover:border-pink-300 hover:bg-pink-50/30"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
          <ImageIcon className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-700">
            Click to select images
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            JPG, PNG, WebP — multiple files supported
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Selected files preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-100"
            >
              <ImageIcon className="h-4 w-4 shrink-0 text-zinc-400" />
              <p className="flex-1 truncate text-xs font-medium text-zinc-700">
                {file.name}
              </p>
              <p className="shrink-0 text-xs text-zinc-400">
                {(file.size / 1024).toFixed(0)} KB
              </p>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || files.length === 0}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${
          files.length > 0 && !loading
            ? "bg-zinc-900 text-white hover:bg-zinc-700"
            : "cursor-not-allowed bg-zinc-100 text-zinc-400"
        }`}
      >
        {loading ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Uploading…</>
        ) : (
          <><Upload className="h-4 w-4" /> Upload {files.length > 0 ? `${files.length} image${files.length > 1 ? "s" : ""}` : "Images"}</>
        )}
      </button>
    </form>
  );
}
