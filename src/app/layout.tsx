import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/provider/AppProviders";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from 'sonner';
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "TuitionEd - Online Tutoring",
    template: `%s | TuitionEd - Online Tutoring`,
  },
  description: "Expert Online Tutoring for personal and academic growth.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "TuitionEd",
    description: "Expert Online Tutoring for personal and academic growth.",
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    siteName: "TuitionEd",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TuitionEd", 
              url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png`,
            }),
          }}
        />
      </head>
      <body>
        <AppProviders>
          <Navbar />
          <div className="pt-16">{children}</div>
          <Toaster richColors />
          <Footer />
        </AppProviders>
        {/* Manually inject Speed Insights script to use custom proxied paths */}
        <Script
          src="/js/script.js" // Points to the custom source path in next.config.js
          data-endpoint="/api/send-vitals" // Tells the script where to send data
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
