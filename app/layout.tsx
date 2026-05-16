import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const metadata: Metadata = {
  title: "치지직 포인트 시스템",
  description: "치지직 방송용 채널 포인트 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        <Header/>
        {children}
        <BottomNav/>

        <Toaster
  richColors
  position="top-right"
/>

      </body>
    </html>
  );
}