import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exam Portal",
  description: "Online examination system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}