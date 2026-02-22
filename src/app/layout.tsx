import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/components/common/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Puja Platform | Book Priests for Pujas in Bhubaneswar",
  description: "Book verified priests for pujas in Bhubaneswar. Browse puja catalog, choose your priest, and book online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SessionProvider>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
