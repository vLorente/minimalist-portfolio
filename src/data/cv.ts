import data from "@cv"
import type { CV } from "@/cv"

// Typing the export as CV makes `astro check` fail whenever cv.json drifts from the schema.
export const cv: CV = data

export const CV_PDF = "/cv-valentin-lorente.pdf"

export const OG_IMAGE = { path: "/og.jpg", width: 1200, height: 630, type: "image/jpeg" } as const

export function absoluteUrl(path: string): string {
  return new URL(path, cv.basics.url).href
}
