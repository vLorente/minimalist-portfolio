import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import Lenis from "lenis"
import "lenis/dist/lenis.css"

const ENTER = "top 85%"
const NAV_OFFSET = -80

function initSmoothScroll() {
  const lenis = new Lenis({ anchors: { offset: NAV_OFFSET } })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function initClips() {
  gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", delay: 0.3 }
    )
  })
}

function initReveals() {
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "expo.out",
        delay: Number(el.dataset.delay ?? 0),
        scrollTrigger: { trigger: el, start: ENTER, once: true },
      }
    )
  })

  gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
    gsap.fromTo(
      el.children,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: ENTER, once: true },
      }
    )
  })
}

function initSplitHeadings() {
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    const playOnLoad = el.dataset.split === "load"

    SplitText.create(el, {
      type: "lines, words",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { autoAlpha: 1 })
        return gsap.from(self.words, {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          delay: playOnLoad ? 0.15 : 0,
          scrollTrigger: playOnLoad ? undefined : { trigger: el, start: ENTER, once: true },
        })
      },
    })
  })
}

function initScrubWords() {
  gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
    SplitText.create(el, {
      type: "words",
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
          }
        )
      },
    })
  })
}

function initCounters() {
  gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
    const target = Number(el.dataset.value)
    const state = { value: 0 }
    el.textContent = "0"
    gsap.to(state, {
      value: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: ENTER, once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(state.value))
      },
    })
  })
}

function initTimelines() {
  gsap.utils.toArray<HTMLElement>("[data-timeline]").forEach((el) => {
    const line = el.querySelector<HTMLElement>("[data-timeline-line]")
    if (!line) return
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 70%", scrub: true },
      }
    )
  })
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>("[data-progress]")
  if (!bar) return
  gsap.fromTo(
    bar,
    { scaleX: 0 },
    { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } }
  )
}

const root = document.documentElement

if (root.classList.contains("motion")) {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  initSmoothScroll()
  initClips()
  initReveals()
  initSplitHeadings()
  initScrubWords()
  initCounters()
  initTimelines()
  initProgress()
  root.classList.add("motion-ready")
}
