"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastState = {
  message: string;
  type: ToastType;
} | null;

const CONFIG: Record<
  ToastType,
  {
    Icon: React.ElementType;
    bg: string;
    text: string;
    iconColor: string;
    ring: string;
    bar: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    bg: "bg-white",
    text: "text-zinc-800",
    iconColor: "text-green-500",
    ring: "ring-green-200",
    bar: "bg-green-400",
  },
  error: {
    Icon: XCircle,
    bg: "bg-white",
    text: "text-zinc-800",
    iconColor: "text-red-500",
    ring: "ring-red-200",
    bar: "bg-red-400",
  },
  info: {
    Icon: Info,
    bg: "bg-white",
    text: "text-zinc-800",
    iconColor: "text-blue-500",
    ring: "ring-blue-200",
    bar: "bg-blue-400",
  },
  warning: {
    Icon: AlertTriangle,
    bg: "bg-white",
    text: "text-zinc-800",
    iconColor: "text-amber-500",
    ring: "ring-amber-200",
    bar: "bg-amber-400",
  },
};

const DURATION = 4000;

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setProgress(100);
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - (startRef.current ?? now);
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [toast]);

  function handleClose() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVisible(false);
    setTimeout(onClose, 300);
  }

  if (!toast) return null;

  const { Icon, bg, text, iconColor, ring, bar } = CONFIG[toast.type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`relative overflow-hidden flex items-start gap-3 min-w-[300px] max-w-sm rounded-2xl px-5 py-4 shadow-xl ring-1 ${bg} ${text} ${ring}`}
      >
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />

        <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>

        <button
          onClick={handleClose}
          className="ml-1 shrink-0 rounded-lg p-0.5 opacity-40 transition hover:opacity-80"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100">
          <div
            className={`h-full ${bar} transition-none`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
