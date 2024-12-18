/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import { DM_Sans } from 'next/font/google'
import { Manrope } from 'next/font/google'
import { cn } from '@/lib/utils'
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const fontHeading = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: "StudySphere",
  description: "Study Companion for NUS Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        </head>
        <body
          className={cn(
            'antialiased',
            fontHeading.variable,
            fontBody.variable
          )}
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </body>
      </html>
  );
}
