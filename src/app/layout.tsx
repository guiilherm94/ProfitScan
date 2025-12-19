import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProfitScan AI | O Detector de Lucro Oculto",
  description: "Descubra se seu produto está dando lucro real. O consultor financeiro com I.A. para MEIs e pequenos empreendedores.",
  keywords: "lucro, margem, MEI, empreendedor, calculadora, preço, custo, análise financeira, IA",
  authors: [{ name: "ProfitScan AI" }],
  openGraph: {
    title: "ProfitScan AI | O Detector de Lucro Oculto",
    description: "Descubra se seu produto está dando lucro real. O consultor financeiro com I.A. para MEIs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
