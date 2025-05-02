import "./globals.css";
import { Inter, Roboto, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter"
});

const roboto = Roboto({ 
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto"
});

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: "Alpha CRM",
  description: "CRM система для управления кураторами и воркерами",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto.variable} ${montserrat.variable} font-montserrat`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="alpha-crm-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
