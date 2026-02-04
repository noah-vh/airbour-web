import type { Metadata } from "next";
import { ConvexProviderWrapper } from "./convex-provider";
import { ClerkWrapper } from "./clerk-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbour - Intelligence That Learns Your Business",
  description: "AI-powered innovation intelligence platform. Gather signals, generate content, and get personalized recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Cactus Classical Serif from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cactus+Classical+Serif&display=swap"
          rel="stylesheet"
        />
        {/* Satoshi from Fontshare */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ClerkWrapper>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <ConvexProviderWrapper>{children}</ConvexProviderWrapper>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </ClerkWrapper>
      </body>
    </html>
  );
}
