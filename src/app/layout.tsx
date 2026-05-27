import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Flow Web — Plan Your Group Trips Together",
  description:
    "Flow Web giúp nhóm bạn bè cùng lên kế hoạch du lịch — tìm kiếm địa điểm, tổng hợp rating, và build board kế hoạch theo thời gian thực.",
  keywords: ["travel", "group planning", "trip", "board", "real-time"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
