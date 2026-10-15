// Renders the social preview card (public/og.jpg) and the apple-touch icon
// (public/apple-touch-icon.png) from cv.json. Re-run after changing the
// headline, label or photo: `pnpm social-images`.
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const root = new URL("../", import.meta.url)
const cv = JSON.parse(await readFile(new URL("cv.json", root), "utf8"))
const { name, headline, label, image, url } = cv.basics

async function dataUri(relativePath, mime) {
  const bytes = await readFile(new URL(relativePath, root))
  return `data:${mime};base64,${bytes.toString("base64")}`
}

const serif = await dataUri(
  "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
  "font/woff2"
)
const sans = await dataUri(
  "node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  "font/woff2"
)
const photo = await dataUri(`public${image}`, "image/webp")

const role = label.split(" · ").slice(0, 2).join(" · ")
const host = new URL(url).host

const fonts = `
  @font-face { font-family: "Instrument Serif"; src: url(${serif}) format("woff2"); }
  @font-face { font-family: "Inter Tight"; src: url(${sans}) format("woff2"); font-weight: 100 900; }
  html, body { margin: 0; background: #0b0b0c; color: #ededed; }
`

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  .card { box-sizing: border-box; width: 1200px; height: 630px; padding: 72px 80px;
    display: flex; align-items: center; justify-content: space-between; gap: 64px; }
  .text { display: flex; flex-direction: column; gap: 28px; max-width: 640px; }
  .name { margin: 0; font: 500 22px/1 "Inter Tight"; letter-spacing: 0.14em; text-transform: uppercase; color: #8a8a8a; }
  h1 { margin: 0; font: 400 84px/0.98 "Instrument Serif"; letter-spacing: -0.02em; }
  .role { margin: 0; font: 500 26px/1.3 "Inter Tight"; }
  .host { margin: 0; display: flex; align-items: center; gap: 16px; font: 500 22px/1 "Inter Tight"; color: #c6ff3d; }
  .bar { width: 48px; height: 3px; background: #c6ff3d; }
  figure { position: relative; flex: none; width: 360px; height: 450px; margin: 0; border-radius: 20px; overflow: hidden; }
  figure img { width: 100%; height: 100%; object-fit: cover; filter: saturate(0.75) contrast(1.1) brightness(0.95); }
  /* Same color grade as the hero photo (src/components/sections/Hero.astro). */
  figure::before, figure::after { content: ""; position: absolute; inset: 0; }
  figure::before { background: radial-gradient(120% 90% at 70% 20%, transparent 45%, #0b0b0c 100%); }
  figure::after { background: linear-gradient(200deg, #c6ff3d 0%, transparent 45%); mix-blend-mode: soft-light; opacity: 0.5; }
</style></head><body><main class="card">
  <div class="text">
    <p class="name">${name}</p>
    <h1>${headline}</h1>
    <p class="role">${role}</p>
    <p class="host"><span class="bar"></span>${host}</p>
  </div>
  <figure><img src="${photo}" alt=""></figure>
</main></body></html>`

const iconHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  .icon { width: 180px; height: 180px; display: grid; place-items: center;
    background: #0b0b0c; font: 400 132px/1 "Instrument Serif"; color: #ededed; }
</style></head><body><div class="icon">VL</div></body></html>`

const browser = await chromium.launch()
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await og.setContent(ogHtml, { waitUntil: "load" })
  await og.evaluate(() => document.fonts.ready)
  await og.screenshot({ path: fileURLToPath(new URL("public/og.jpg", root)), type: "jpeg", quality: 88 })

  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } })
  await icon.setContent(iconHtml, { waitUntil: "load" })
  await icon.evaluate(() => document.fonts.ready)
  await icon.screenshot({ path: fileURLToPath(new URL("public/apple-touch-icon.png", root)) })
} finally {
  await browser.close()
}

console.log("Wrote public/og.jpg and public/apple-touch-icon.png")
