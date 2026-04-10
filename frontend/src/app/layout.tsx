import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "رينت فلو – نظام متطور لإدارة الإيجارات",
  description: "إدارة العقارات، المستأجرين، العقود، والمدفوعات بسهولة وبساطة.",
};

import { Toaster } from 'sonner';
import { CurrencyProvider } from "@/context/currency-context";

import { ThemeProvider } from "@/context/theme-context";
import { LanguageProvider } from "@/context/language-context";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className="transition-colors duration-200">
        <LanguageProvider>
          <ThemeProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </ThemeProvider>
        </LanguageProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
