import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthProviderWrapper from "@/components/AuthProviderWrapper";

// Bootstrap JS will be imported in the client component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CST SportSpot",
  description: "Campus Sports Venue Booking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
