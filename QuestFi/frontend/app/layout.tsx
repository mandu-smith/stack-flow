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