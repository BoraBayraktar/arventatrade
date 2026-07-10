import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArventaTrade",
  description: "ArventaTrade e-ticaret vitrin ve backoffice uygulaması",
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
