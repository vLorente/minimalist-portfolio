import data from "@cv"
import type { CV } from "@/cv"

// Typing the export as CV makes `astro check` fail whenever cv.json drifts from the schema.
export const cv: CV = data

export const CV_PDF = "/cv-valentin-lorente.pdf"
