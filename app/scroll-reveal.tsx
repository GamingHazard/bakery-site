"use client"

import { useEffect } from "react"

const revealSelector = [
  "main :is(h1, h2, h3, p, li, blockquote, label, .eyebrow, .button, button, input, textarea, select, img)",
  "footer :is(h2, h3, p, li, .button, button, img)",
].join(",")

export default function ScrollRevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!("IntersectionObserver" in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute("data-scroll-reveal", "visible")
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.06, rootMargin: "0px 0px -8% 0px" },
    )

    const prepare = (element: Element) => {
      if (element.getAttribute("data-scroll-reveal") === "visible") return

      if (!element.hasAttribute("data-scroll-reveal")) {
        const siblingIndex = element.parentElement
          ? Array.prototype.indexOf.call(element.parentElement.children, element)
          : 0
        ;(element as HTMLElement).style.setProperty(
          "--scroll-reveal-delay",
          `${Math.min(siblingIndex, 4) * 65}ms`,
        )
        element.setAttribute("data-scroll-reveal", "hidden")
      }

      observer.observe(element)
    }

    const scan = (root: ParentNode) => {
      if (root instanceof Element && root.matches(revealSelector)) prepare(root)
      root.querySelectorAll(revealSelector).forEach(prepare)
    }

    scan(document)
    document.documentElement.classList.add("scroll-reveal-ready")

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node)
        })
      })
    })

    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
      document.documentElement.classList.remove("scroll-reveal-ready")
    }
  }, [])

  return null
}
