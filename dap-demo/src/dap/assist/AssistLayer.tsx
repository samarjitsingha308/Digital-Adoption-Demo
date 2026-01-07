import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { clamp, getRect } from '../utils/dom'
import { useDap } from '../useDap'

type AssistReason = 'idle' | 'invalid' | 'nudge'

function isValidEmail(v: string) {
  // simple demo validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function AssistPopover({
  formId,
  fieldId,
  anchorEl,
  reason,
  onClose,
  onApplyExample,
}: {
  formId: string
  fieldId: string
  anchorEl: HTMLElement
  reason: AssistReason
  onClose: () => void
  onApplyExample: (fieldId: string, value: string) => void
}) {
  const { content, startWalkthrough } = useDap()
  const field = content.assist.forms[formId]?.fields[fieldId]

  const [expanded, setExpanded] = useState(false)

  const pos = useMemo(() => {
    const r = getRect(anchorEl)
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = 380
    const height = expanded ? 290 : 240
    const margin = 12

    const rawTop = r.top + r.height / 2 - height / 2
    const rawLeft = r.right + 14

    const top = clamp(rawTop, margin, vh - height - margin)
    const left = clamp(rawLeft, margin, vw - width - margin)
    return { top, left, width }
  }, [anchorEl, expanded])

  if (!field) return null

  const headline =
    reason === 'invalid'
      ? 'Looks like this might be invalid'
      : reason === 'nudge'
        ? 'Need help finishing this?'
        : 'Need a hand?'

  return createPortal(
    <div className="fixed inset-0 z-[1200]" onMouseDown={onClose}>
      <div
        className="absolute w-[380px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        role="dialog"
        aria-modal="false"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-slate-400">
              Assist Mode
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-50">{headline}</div>
            <div className="mt-2 text-sm text-slate-200">
              <span className="font-semibold text-slate-100">{field.label}:</span>{' '}
              {field.hint}
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onClick={onClose}
            aria-label="Close assist"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {field.example ? (
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-200">
            <div className="text-xs font-semibold tracking-wide text-slate-400">Example</div>
            <div className="mt-1 font-medium text-slate-100">{field.example}</div>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {field.example ? (
            <button
              className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300"
              onClick={() => {
                if (!field.example) return
                onApplyExample(fieldId, field.example)
                onClose()
              }}
            >
              Use example
            </button>
          ) : null}

          {field.showMeHowWalkthroughId ? (
            <button
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              onClick={() => {
                const id = field.showMeHowWalkthroughId
                if (!id) return
                onClose()
                startWalkthrough(id)
              }}
            >
              Show me how
            </button>
          ) : null}

          {field.readMore?.length ? (
            <button
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Hide details' : 'Read more'}
            </button>
          ) : null}
        </div>

        {expanded && field.readMore?.length ? (
          <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-200">
            {field.readMore.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

function NeedHelpToast({ onHelp, onDismiss }: { onHelp: () => void; onDismiss: () => void }) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[1150]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
        <div className="text-sm text-slate-200">
          Need help finishing this form?
        </div>
        <button
          className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300"
          onClick={onHelp}
        >
          Help me
        </button>
        <button
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
          onClick={onDismiss}
        >
          Not now
        </button>
      </div>
    </div>,
    document.body,
  )
}

export function AssistLayer({
  formId,
  onApplyExample,
}: {
  formId: string
  onApplyExample: (fieldId: string, value: string) => void
}) {
  const { assistModeEnabled, page, content } = useDap()

  const formCfg = content.assist.forms[formId]
  const idleMs = formCfg?.idlePromptMs ?? 6000
  const nudgeMs = formCfg?.stuckNudgeMs ?? 12000

  const idleTimer = useRef<number | null>(null)
  const nudgeTimer = useRef<number | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [openState, setOpenState] = useState<{
    fieldId: string
    anchorEl: HTMLElement
    reason: AssistReason
  } | null>(null)

  const focusedElRef = useRef<HTMLElement | null>(null)
  const lastTypedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!assistModeEnabled || page !== 'onboarding') return

    const root = document.querySelector(`[data-assist-form='${formId}']`)
    if (!root) return

    const clearTimers = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
      if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current)
      idleTimer.current = null
      nudgeTimer.current = null
    }

    const scheduleIdle = () => {
      if (!assistModeEnabled) return
      clearTimers()

      idleTimer.current = window.setTimeout(() => {
        const el = focusedElRef.current
        if (!el) return
        const fieldId = el.getAttribute('data-assist-field')
        if (!fieldId) return
        setOpenState({ fieldId, anchorEl: el, reason: 'idle' })
      }, idleMs)

      nudgeTimer.current = window.setTimeout(() => {
        // show a gentle, non-intrusive nudge if user is still idle
        const sinceTyped = Date.now() - lastTypedAtRef.current
        if (sinceTyped >= nudgeMs) setToastOpen(true)
      }, nudgeMs)
    }

    const onFocusIn = (e: Event) => {
      const t = e.target
      if (!(t instanceof HTMLElement)) return
      const fieldId = t.getAttribute('data-assist-field')
      if (!fieldId) return
      focusedElRef.current = t
      lastTypedAtRef.current = Date.now()
      setToastOpen(false)
      scheduleIdle()
    }

    const onInput = (e: Event) => {
      const t = e.target
      if (!(t instanceof HTMLElement)) return
      if (!t.getAttribute('data-assist-field')) return
      lastTypedAtRef.current = Date.now()
      setToastOpen(false)
      // if user is typing, close the idle prompt
      if (openState?.reason === 'idle') setOpenState(null)
      scheduleIdle()
    }

    const onBlur = (e: Event) => {
      const t = e.target
      if (!(t instanceof HTMLInputElement)) return
      const fieldId = t.getAttribute('data-assist-field')
      if (!fieldId) return

      // demo: email validation assist
      if (fieldId === 'billingEmail' && t.value.trim() && !isValidEmail(t.value)) {
        setOpenState({ fieldId, anchorEl: t, reason: 'invalid' })
      }
    }

    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('input', onInput)
    root.addEventListener('blur', onBlur, true)
    scheduleIdle()

    return () => {
      clearTimers()
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('input', onInput)
      root.removeEventListener('blur', onBlur, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistModeEnabled, formId, idleMs, nudgeMs, page])

  if (!assistModeEnabled || page !== 'onboarding') return null

  return (
    <>
      {toastOpen ? (
        <NeedHelpToast
          onHelp={() => {
            setToastOpen(false)
            const el = focusedElRef.current
            if (el) {
              const fieldId = el.getAttribute('data-assist-field')
              if (fieldId) setOpenState({ fieldId, anchorEl: el, reason: 'nudge' })
            }
          }}
          onDismiss={() => setToastOpen(false)}
        />
      ) : null}

      {openState ? (
        <AssistPopover
          formId={formId}
          fieldId={openState.fieldId}
          anchorEl={openState.anchorEl}
          reason={openState.reason}
          onClose={() => setOpenState(null)}
          onApplyExample={onApplyExample}
        />
      ) : null}
    </>
  )
}

