import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  // change to your prod domain once it’s live
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://bonknetwork.com"),
  title: {
    default: "BonkAI Analytics",
    template: "%s · BonkAI Analytics",
  },
  description: "Intelligence Platform powered by Bonk Network",
  applicationName: "BonkAI",
  generator: "Bonk Network",
  icons: {
    icon: "/icon.png",          // app/icon.png (512×512 recommended; 32×32 also ok)
    apple: "/apple-icon.png",   // optional: app/apple-icon.png (180×180)
  },
  openGraph: {
    title: "BonkAI Analytics",
    description: "Intelligence Platform powered by Bonk Network",
    url: "/",
    siteName: "BonkAI",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BonkAI" }], // optional
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BonkAI Analytics",
    description: "Intelligence Platform powered by Bonk Network",
    images: ["/og.png"], // optional
  },
  themeColor: "#ff7a00",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
