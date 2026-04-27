import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GizmoHUB - Mạng lưới sinh viên",
  description: "Nền tảng lưu trữ tài liệu và đánh giá giảng viên",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased text-slate-800 bg-slate-50">
        {children}
      </body>
    </html>
  );
}