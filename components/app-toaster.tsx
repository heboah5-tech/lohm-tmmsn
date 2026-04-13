"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      dir="rtl"
      toastOptions={{
        style: {
          borderRadius: "14px",
          fontFamily: "Cairo, Tajawal, sans-serif",
          fontSize: "13px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.06)",
        },
      }}
    />
  );
}
