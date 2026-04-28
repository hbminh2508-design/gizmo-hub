import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "GizmoHUB - Ecosystem for Students",
  description: "Hệ sinh thái hỗ trợ sinh viên - Phát triển bởi UET-ER",
  icons: {
    icon: "/icon.png", // Đảm bảo dòng này trỏ đúng vào file logo của bạn trong thư mục public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning là bắt buộc để next-themes không báo lỗi khi chèn class "dark" vào HTML
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-500 bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-50">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}