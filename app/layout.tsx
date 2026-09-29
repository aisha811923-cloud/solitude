import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solitude — Midnight Sad Songs Sanctuary",
  description:
    "An intimate, hardware-modeled midnight sad songs sanctuary. 30 curated songs, 60 FPS rain physics, Lo-Fi DSP acoustics, and nocturnal communal presence.",
  keywords: [
    "sad songs",
    "lo-fi",
    "solitude",
    "rain sounds",
    "ambient audio",
    "web audio api",
    "sanctuary",
  ],
  authors: [{ name: "Solitude Engineering Team" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#070B14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#070B14] text-neutral-100 min-h-screen overflow-hidden antialiased selection:bg-amber-500/30 selection:text-amber-200"
      >
        {children}
      </body>
    </html>
  );
}
