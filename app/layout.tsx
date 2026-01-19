import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { ConsoleWrapper } from "./components/console-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ryanwaits.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Ryan Waits",
    template: "%s | Ryan Waits",
  },
  description: "Product engineer building developer tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <head>
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(theme);
                })();
              `,
            }}
          />
        </head>
        <body className="antialiased tracking-tight font-sans">
          {children}
          <ConsoleWrapper />
        </body>
      </html>
    </ViewTransitions>
  );
}
