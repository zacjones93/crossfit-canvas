import { Permanent_Marker, Rubik_Wet_Paint } from "next/font/google"
import { OPEN_THEME } from "@/lib/open/constants"
import { cn } from "@/lib/utils"

// Event themes for the public pages. A theme is only a class on the event's subtree: it overrides the
// open-* tokens (accent, display/heading fonts) and surface colors in globals.css. Fonts load per theme.

/** Drippy graffiti lettering for the event title (the poster's "SEWER WAR"). */
const wetPaint = Rubik_Wet_Paint({ weight: "400", subsets: ["latin"], variable: "--font-rubik-wet-paint", display: "swap" })
/** Brush-marker caps for headings and team names (the poster's "TEAM LEO", "PARTICIPATION"). */
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker", display: "swap" })

const THEME_CLASS: Record<string, string> = {
  [OPEN_THEME.CLASSIC]: "",
  [OPEN_THEME.SEWER]: cn("open-theme-sewer", wetPaint.variable, marker.variable),
}

/** Class for an event's public subtree; unknown themes fall back to the site look. */
export function openThemeClass(theme: string): string {
  return THEME_CLASS[theme] ?? ""
}
