import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Official Statistical Capacity Building Platform | MoSPI",
  description: "AI-Powered Competency Intelligence and Capacity Building Platform for India's Official Statistical System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
