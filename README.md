# vlorente.dev

Portfolio personal de **Valentín Lorente**, Product Owner y Technical Product Manager. Es una web de una sola página, oscura y animada con el scroll, pensada para que un recruiter vea en un minuto qué he hecho y con qué resultados.

**En producción:** [www.vlorente.dev](https://www.vlorente.dev)

## Qué incluye

- **Secciones:** portada, impacto en cifras, sobre mí, experiencia, competencias, formación y contacto, con descarga del CV en PDF.
- **Animaciones con el scroll:** textos que se revelan, contadores, una línea de tiempo que se dibuja y una foto que se descubre. Respetan `prefers-reduced-motion`, y sin JavaScript todo el contenido sigue visible.
- **SEO y previews:** metadatos Open Graph y Twitter, datos estructurados JSON-LD (`Person`), `robots.txt`, `sitemap.xml` y una tarjeta de 1200×630 para cuando se comparte el enlace.
- **Accesibilidad:** enlace para saltar al contenido, landmarks, iconos ocultos al lector de pantalla y enlaces externos que avisan de que abren pestaña nueva.

## Stack

- [Astro 4](https://astro.build/) + TypeScript estricto, generado como sitio estático.
- [GSAP](https://gsap.com/) (ScrollTrigger y SplitText) y [Lenis](https://lenis.darkroom.engineering/) para el scroll suave.
- Tipografías Instrument Serif e Inter Tight, servidas desde el propio sitio con Fontsource.
- [Playwright](https://playwright.dev/) para generar la imagen de preview y el icono de iOS.
- Despliegue en [Vercel](https://vercel.com/) con Web Analytics.

## Puesta en marcha

Requiere Node y [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:4321](http://localhost:4321).

## Comandos

| Comando              | Qué hace                                                                                          |
| :------------------- | :------------------------------------------------------------------------------------------------ |
| `pnpm dev`           | Servidor de desarrollo en `localhost:4321` (también `pnpm start`).                                |
| `pnpm build`         | Comprueba tipos con `astro check` y genera el build de producción. Es la única verificación.      |
| `pnpm preview`       | Sirve el build de producción en local.                                                            |
| `pnpm social-images` | Regenera `public/og.jpg` y `public/apple-touch-icon.png` a partir de `cv.json`.                   |

## Cómo está organizado

- **Contenido:** todo el texto sale de `cv.json`, que sigue el esquema de [JSON Resume](https://jsonresume.org/schema/) con algunos campos propios (titular, cifras de impacto, disponibilidad, SEO). Cambiar la experiencia o las cifras es un cambio de datos, sin tocar componentes. `src/cv.d.ts` lo tipa, así que `pnpm build` falla si el JSON no cuadra.
- **Secciones:** cada una es un componente en `src/components/sections/`, y `src/pages/index.astro` las ordena.
- **Animaciones:** los componentes solo declaran atributos `data-*` (`data-reveal`, `data-split`, `data-counter`, `data-timeline`…) y `src/scripts/motion.ts` los conecta con GSAP.
- **Diseño:** colores, tipografías y espaciado son variables CSS en `src/styles/global.css`.
- **Preview e icono:** si cambias el titular, el cargo o la foto, ejecuta `pnpm social-images` y haz commit de las imágenes.

## Licencia

El código se publica bajo licencia [MIT](LICENSE.txt). El contenido personal (los textos de `cv.json`, la foto y el CV en PDF) no está incluido: no lo reutilices sin permiso.
