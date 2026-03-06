import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
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
  title: "Treewalk Engagement Flow",
  description: "Engagement planning, interview routing, transcript extraction, and draft generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                Treewalk Engagement Ops
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/engagements" className="text-sm text-slate-700 hover:underline">
                  Engagements
                </Link>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
                      Sign in
                    </button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
