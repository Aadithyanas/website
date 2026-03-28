import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aju ERP System",
  description: "Enterprise Resource Planning Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full antialiased dark">
      <body className="min-h-full flex flex-col m-0 p-0 text-white bg-black">
        {children}
      </body>
    </html>
  );
}
