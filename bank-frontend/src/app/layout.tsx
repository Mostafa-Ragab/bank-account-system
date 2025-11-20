import type { Metadata } from "next";
import "./globals.css";
import { AppToaster } from "@/components/atoms/AppToaster";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Bank Account System",
  description: "Homework task frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4">
                <AppToaster />

             <Navbar />

        <main className="w-full flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}