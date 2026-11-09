import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baraka-nest.vercel.app"),
  title: "Baraka Nest",
  description:
    "Find your space. Find your people. Student housing and roommate matching across Kenya.",
  openGraph: {
    type: "website",
    url: "https://baraka-nest.vercel.app/",
    siteName: "Baraka Nest",
    title: "Baraka Nest — Find Your Place",
    description:
      "Find your space. Find your people. Student housing and roommate matching across Kenya.",
    images: [
      {
        url: "/baraka-nest-preview.png",
        width: 512,
        height: 512,
        alt: "Baraka Nest — Find Your Place",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baraka Nest — Find Your Place",
    description:
      "Find your space. Find your people. Student housing and roommate matching across Kenya.",
    images: ["/baraka-nest-preview.png"],
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
