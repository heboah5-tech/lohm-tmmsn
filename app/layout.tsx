/* eslint-disable  @typescript-eslint/no-explicit-any */

import type { Metadata } from "next";
import "./globals.css";
import { AppToaster } from "@/components/app-toaster";

export const metadata: Metadata = {
  title: "لوحة التحكم - BCare",
  description: "لوحة تحكم إدارة زوار BCare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
    
      <body >
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
