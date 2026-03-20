"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Item = {
  label: string;
  onClick: () => void;
};

export function Dropdown({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function updatePosition() {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192;

      setPosition({
        top: rect.bottom + 8,
        left: rect.right - menuWidth,
      });
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200"
      >
        Actions
      </button>

      {mounted && open
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[9999] min-w-[192px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
              style={{
                top: position.top,
                left: position.left,
              }}
            >
              {items.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
