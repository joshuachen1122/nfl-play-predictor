import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    images: ["/og-image.png"]
  },
  metadataBase: new URL("https://your-domain.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        <Nav />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}