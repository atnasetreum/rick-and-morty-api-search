import type { Metadata } from "next";
import { Audiowide, Rajdhani } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const headingFont = Audiowide({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rick and Morty Interface",
  description: "Interactive character interface powered by Rick and Morty API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
