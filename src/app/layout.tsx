import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2BEM",
  description: "2BEM e-ticaret vitrin ve backoffice uygulamasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
