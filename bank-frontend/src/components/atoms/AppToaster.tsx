"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        duration: 2000,
        style: {
          background: "#ffffff",
          color: "#0f172a",
          padding: "10px 16px",
          borderRadius: "999px",
          fontSize: "0.95rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.15)",
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#dcfce7",
          },
          style: {
            borderLeft: "4px solid #16a34a",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fee2e2",
          },
          style: {
            borderLeft: "4px solid #dc2626",
          },
        },
      }}
    />
  );
}