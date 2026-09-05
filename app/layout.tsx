import type { Metadata } from "next";
import "./globals.css";
import { AppToaster } from "@/components/app-toaster";
import { ZoomFontControls } from "@/components/zoom-font-controls";
import { ClientProviders } from "@/components/client-providers";

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
        <ClientProviders>
          {children}
          <AppToaster />
          <ZoomFontControls />
        </ClientProviders>
      </body>
    </html>
  );
}
