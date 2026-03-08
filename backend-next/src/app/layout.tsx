import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabBar from "@/components/TabBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DailySpark - Learn English Every Day",
  description: "Your daily companion for mastering English vocabulary, reading, and conversation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        {/* Fixed Header for Desktop & Mobile */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-12 transition-all duration-300">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>

        {/* Footer for Desktop */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* TabBar for Mobile Only */}
        <div className="md:hidden">
          <TabBar />
        </div>
      </body>
    </html>
  );
}
