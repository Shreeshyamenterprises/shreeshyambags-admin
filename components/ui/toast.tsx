"use client";

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
