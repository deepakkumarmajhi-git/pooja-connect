import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/components/common/SessionProvider";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Puja Platform",
  description: "Book priests for pujas in Bhubaneswar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
