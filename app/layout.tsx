import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Finding Nami — Your Remote Career Community",
  description:
    "A community for Filipina professionals building careers on their own terms. Connect, learn, and find remote opportunities.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://findingnami.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
