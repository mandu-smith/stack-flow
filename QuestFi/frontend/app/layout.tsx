import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { TurnkeyProvider } from "@/providers/TurnkeyProvider";
import { OAuthCallbackHandler } from "@/components/auth/OAuthCallbackHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuestFi - Master Bitcoin DeFi Through Quests",
  description: "Learn Stacks DeFi protocols through gamified quests. Earn NFT badges and compete on leaderboards.",
  other: {
    "talentapp:project_verification": "9d80cd4fa581eed8068c055fcaefe9f6220ba8d393bac62548a8ffc0d1367ae5f0982cae4c27da849c909c37538f282ca28a228cab424f645b596a3f35630a2d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <TurnkeyProvider>
          <OAuthCallbackHandler />
          <Navbar />
          {children}
          <ConditionalFooter />
        </TurnkeyProvider>
      </body>
    </html>
  );
}