/* eslint-disable  @typescript-eslint/no-explicit-any */

import type { Metadata } from "next";
import "./globals.css";
import { AppToaster } from "@/components/app-toaster";
import { ZoomFontControls } from "@/components/zoom-font-controls";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";

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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AppToaster />
            <ZoomFontControls />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
