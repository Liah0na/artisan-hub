import { Handlee, Jost } from "next/font/google";

export const handlee = Handlee({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-secondary",
  weight: "400",
});

export const jost = Jost({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-primary",
  weight: ["400", "700", "900"],
});