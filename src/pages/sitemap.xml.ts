import type { APIRoute } from "astro"
import { absoluteUrl } from "@/data/cv"

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${absoluteUrl("/")}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } })
}
