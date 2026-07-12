"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; type: "success" | "error" };

let addToast: (t: Toast) => void = () => {};

export function showToast(message: string, type: "success" | "error" = "success") {
  addToast({ id: Date.now(), message, type });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToast = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
            t.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
