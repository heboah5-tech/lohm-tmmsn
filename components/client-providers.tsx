"use client"

import { ThemeProvider } from "@/components/theme-provider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
