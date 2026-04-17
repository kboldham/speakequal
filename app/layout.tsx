import "./globals.css";
import { Providers } from "./components/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpeakEqual",
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
