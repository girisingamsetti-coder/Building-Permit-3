import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LTP Approval — Building Permit Management System",
  description:
    "Online Building Permit Application & Approval Portal for Licensed Technical Persons (LTP) and approval officers.",
  keywords: [
    "LTP Approval",
    "Building Permit Management System",
    "Building Permit",
    "Approval Workflow",
    "Scrutiny",
    "Government e-Service",
  ],
  authors: [{ name: "LTP Approval" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
