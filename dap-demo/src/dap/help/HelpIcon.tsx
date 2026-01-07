import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDap } from '../useDap'
import { clamp, getRect } from '../utils/dom'

function HelpPopover({
  topicId,
  anchorEl,
  onClose,
}: {
  topicId: string
  anchorEl: HTMLElement
  onClose: () => void
}) {
  const { content, startWalkthrough } = useDap()
  const topic = content.helpTopics[topicId]

  const [expanded, setExpanded] = useState(false)

  const pos = useMemo(() => {
    const r = getRect(anchorEl)
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = 360
    const height = expanded ? 260 : 210
    const margin = 12

    const rawTop = r.bottom + 10
    const rawLeft = r.left + r.width / 2 - width / 2

    const top = clamp(rawTop, margin, vh - height - margin)
    const left = clamp(rawLeft, margin, vw - width - margin)
    return { top, left, width }
  }, [anchorEl, expanded])

  if (!topic) return null

  return createPortal(
    <div className="fixed inset-0 z-[1100]" onMouseDown={onClose}>
      <div
        className="absolute rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        role="dialog"
        aria-modal="false"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-50">{topic.title}</div>
            <div className="mt-1 text-sm text-slate-200">{topic.summary}</div>
          </div>
          <button
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onClick={onClose}
            aria-label="Close help"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {topic.showMeHowWalkthroughId ? (
            <button
              className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300"
              onClick={() => {
                const walkthroughId = topic.showMeHowWalkthroughId
                if (!walkthroughId) return
                onClose()
                startWalkthrough(walkthroughId)
              }}
            >
              Show me how
            </button>
          ) : null}

          {topic.readMore?.length ? (
            <button
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Hide details' : 'Read more'}
            </button>
          ) : null}
        </div>

        {expanded && topic.readMore?.length ? (
          <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-200">
            {topic.readMore.map((p, idx) => (
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

export function HelpIcon({ topicId, className }: { topicId: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  return (
    <>
      <button
        type="button"
        className={
          className ??
          'inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400'
        }
        aria-label="Help"
        data-help-topic={topicId}
        onClick={(e) => {
          setAnchorEl(e.currentTarget)
          setOpen(true)
        }}
      >
        ?
      </button>
      {open && anchorEl ? (
        <HelpPopover topicId={topicId} anchorEl={anchorEl} onClose={() => setOpen(false)} />
      ) : null}
    </>
  )
}

