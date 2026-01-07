import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDap } from '../useDap'
import type { Rect } from '../utils/dom'
import { clamp, getRect, isRectMostlyInViewport, waitForElement } from '../utils/dom'
import type { WalkthroughPlacement } from '../types'

type OverlayState = {
  targetEl: Element | null
  targetRect: Rect | null
  missing: boolean
}

function useOverlayState(selector: string | null) {
  const [state, setState] = useState<OverlayState>({
    targetEl: null,
    targetRect: null,
    missing: false,
  })

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!selector) {
        setState({ targetEl: null, targetRect: null, missing: true })
        return
      }

      const el = await waitForElement(selector, 1200)
      if (cancelled) return

      if (!el) {
        setState({ targetEl: null, targetRect: null, missing: true })
        return
      }

      const rect = getRect(el)

      if (!isRectMostlyInViewport(rect)) {
        try {
          ;(el as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })
        } catch {
          // ignore
        }
        // allow scroll settle
        await new Promise((r) => window.setTimeout(r, 350))
        if (cancelled) return
      }

      setState({ targetEl: el, targetRect: getRect(el), missing: false })
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [selector])

  useEffect(() => {
    if (!state.targetEl) return

    const onScroll = () => setState((s) => (s.targetEl ? { ...s, targetRect: getRect(s.targetEl) } : s))
    const onResize = () => setState((s) => (s.targetEl ? { ...s, targetRect: getRect(s.targetEl) } : s))

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [state.targetEl])

  return state
}

function computePopoverPosition(args: {
  targetRect: Rect | null
  placement: WalkthroughPlacement
  width: number
  height: number
}): { top: number; left: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const margin = 12
  const fallback = {
    top: vh / 2 - args.height / 2,
    left: vw / 2 - args.width / 2,
  }

  if (!args.targetRect) {
    return {
      top: clamp(fallback.top, margin, vh - args.height - margin),
      left: clamp(fallback.left, margin, vw - args.width - margin),
    }
  }

  const r = args.targetRect
  const candidates: WalkthroughPlacement[] =
    args.placement === 'auto' ? ['right', 'bottom', 'left', 'top'] : [args.placement]

  for (const p of candidates) {
    let top = r.top
    let left = r.left

    if (p === 'right') {
      top = r.top + r.height / 2 - args.height / 2
      left = r.right + 14
    } else if (p === 'left') {
      top = r.top + r.height / 2 - args.height / 2
      left = r.left - args.width - 14
    } else if (p === 'bottom') {
      top = r.bottom + 14
      left = r.left + r.width / 2 - args.width / 2
    } else if (p === 'top') {
      top = r.top - args.height - 14
      left = r.left + r.width / 2 - args.width / 2
    }

    const clamped = {
      top: clamp(top, margin, vh - args.height - margin),
      left: clamp(left, margin, vw - args.width - margin),
    }

    const ok =
      clamped.top === top ||
      clamped.left === left ||
      // allow minor clamping; reject if severely clipped
      (Math.abs(clamped.top - top) < 24 && Math.abs(clamped.left - left) < 24)

    if (ok) return clamped
  }

  return {
    top: clamp(fallback.top, margin, vh - args.height - margin),
    left: clamp(fallback.left, margin, vw - args.width - margin),
  }
}

export function WalkthroughOverlay() {
  const {
    isWalkthroughOpen,
    activeWalkthrough,
    activeStep,
    activeStepIndex,
    nextStep,
    prevStep,
    endWalkthrough,
    goToStep,
  } = useDap()

  const selector = activeStep?.target ?? null
  const { targetRect, missing } = useOverlayState(isWalkthroughOpen ? selector : null)

  const [popoverSize, setPopoverSize] = useState({ width: 360, height: 220 })
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setPopoverSize({ width: r.width, height: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [isWalkthroughOpen])

  useEffect(() => {
    if (!isWalkthroughOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endWalkthrough()
      if (e.key === 'ArrowRight') nextStep()
      if (e.key === 'ArrowLeft') prevStep()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [endWalkthrough, isWalkthroughOpen, nextStep, prevStep])

  const isLast = Boolean(activeWalkthrough && activeStepIndex === activeWalkthrough.steps.length - 1)
  const canPrev = activeStepIndex > 0
  const total = activeWalkthrough?.steps.length ?? 0

  const placement = activeStep?.placement ?? 'auto'
  const popoverPos = useMemo(() => {
    return computePopoverPosition({
      targetRect: missing ? null : targetRect,
      placement,
      width: popoverSize.width,
      height: popoverSize.height,
    })
  }, [missing, placement, popoverSize.height, popoverSize.width, targetRect])

  const pad = 8
  const highlightStyle = useMemo(() => {
    if (!targetRect || missing) return undefined
    const top = targetRect.top - pad
    const left = targetRect.left - pad
    const width = targetRect.width + pad * 2
    const height = targetRect.height + pad * 2
    return { top, left, width, height }
  }, [missing, targetRect])

  if (!isWalkthroughOpen || !activeWalkthrough || !activeStep) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] font-sans"
      aria-hidden="false"
      onMouseDown={(e) => {
        // prevent background interactions
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {/* Dim background + highlight */}
      <div className="absolute inset-0">
        {highlightStyle ? (
          <div
            className="absolute rounded-xl ring-2 ring-sky-300/90 transition-all duration-300"
            style={{
              ...highlightStyle,
              boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.72)',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-950/75 transition-opacity duration-300" />
        )}
      </div>

      {/* Step card */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        className="absolute w-[360px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-md transition-[top,left] duration-300"
        style={{ top: popoverPos.top, left: popoverPos.left }}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-400">
              Step {activeStepIndex + 1} of {total}
            </div>
            <div className="mt-1 text-base font-semibold text-slate-50">{activeStep.title}</div>
          </div>
          <button
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onClick={endWalkthrough}
            aria-label="Close walkthrough"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="px-4 pb-3 pt-2 text-sm text-slate-200">
          <p className="leading-relaxed">{activeStep.body}</p>

          {missing ? (
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              This step’s target element wasn’t found. That’s expected in this demo to
              show graceful handling when the UI changes or a feature is gated.
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canPrev}
              onClick={prevStep}
            >
              Previous
            </button>
            <button
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              onClick={endWalkthrough}
            >
              Skip
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  className={`h-2 w-2 rounded-full transition ${
                    i === activeStepIndex ? 'bg-sky-300' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => goToStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
            <button
              className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300"
              onClick={isLast ? endWalkthrough : nextStep}
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

