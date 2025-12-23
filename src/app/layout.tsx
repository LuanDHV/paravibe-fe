export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from '@/components/providers/Providers';
import { AppLayout } from '@/components/layout/AppLayout';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ParaVibe - AI-Powered Music Discovery",
  description: "Discover new music with AI-powered recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
