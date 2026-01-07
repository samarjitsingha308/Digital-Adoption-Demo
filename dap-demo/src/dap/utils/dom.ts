export type Rect = {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

export function getRect(el: Element): Rect {
  const r = el.getBoundingClientRect()
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    right: r.right,
    bottom: r.bottom,
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function isRectMostlyInViewport(rect: Rect, thresholdPx = 8): boolean {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return (
    rect.top >= -thresholdPx &&
    rect.left >= -thresholdPx &&
    rect.bottom <= vh + thresholdPx &&
    rect.right <= vw + thresholdPx
  )
}

export async function waitForElement(
  selector: string,
  timeoutMs: number,
): Promise<Element | null> {
  const existing = document.querySelector(selector)
  if (existing) return existing

  return await new Promise((resolve) => {
    let done = false
    const finish = (el: Element | null) => {
      if (done) return
      done = true
      try {
        obs.disconnect()
      } catch {
        // ignore
      }
      clearTimeout(t)
      resolve(el)
    }

    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) finish(el)
    })

    obs.observe(document.documentElement, { childList: true, subtree: true })

    const t = window.setTimeout(() => finish(null), timeoutMs)
  })
}

