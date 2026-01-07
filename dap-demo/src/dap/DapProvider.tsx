import { useCallback, useMemo, useState } from 'react'
import contentJson from './content.json'
import { DapContext } from './context'
import type { AppPageId, DapContent, Walkthrough, WalkthroughStep } from './types'

type DapState = {
  content: DapContent
  page: AppPageId
  assistModeEnabled: boolean
  activeWalkthrough: Walkthrough | null
  activeStepIndex: number
  isWalkthroughOpen: boolean
  openHelpTopicId: string | null
}

type DapActions = {
  setPage: (page: AppPageId) => void
  setAssistModeEnabled: (enabled: boolean) => void
  startWalkthrough: (walkthroughId: string, opts?: { startAt?: number }) => void
  endWalkthrough: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (idx: number) => void
  openHelp: (topicId: string) => void
  closeHelp: () => void
}

export type DapApi = DapState & DapActions & { activeStep: WalkthroughStep | null }

export function DapProvider({ children }: { children: React.ReactNode }) {
  const content = contentJson as DapContent

  const [page, setPage] = useState<AppPageId>('dashboard')
  const [assistModeEnabled, setAssistModeEnabled] = useState(false)
  const [activeWalkthroughId, setActiveWalkthroughId] = useState<string | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [openHelpTopicId, setOpenHelpTopicId] = useState<string | null>(null)

  const activeWalkthrough: Walkthrough | null = useMemo(() => {
    if (!activeWalkthroughId) return null
    return content.walkthroughs[activeWalkthroughId] ?? null
  }, [activeWalkthroughId, content.walkthroughs])

  const activeStep: WalkthroughStep | null = useMemo(() => {
    if (!activeWalkthrough) return null
    return activeWalkthrough.steps[activeStepIndex] ?? null
  }, [activeStepIndex, activeWalkthrough])

  const startWalkthrough = useCallback(
    (walkthroughId: string, opts?: { startAt?: number }) => {
      const wt = content.walkthroughs[walkthroughId]
      if (!wt) return
      const startAt = opts?.startAt ?? 0
      const first = wt.steps[startAt]

      setOpenHelpTopicId(null)
      setActiveWalkthroughId(walkthroughId)
      setActiveStepIndex(startAt)
      if (first?.page) setPage(first.page)
    },
    [content.walkthroughs],
  )

  const endWalkthrough = useCallback(() => {
    setActiveWalkthroughId(null)
    setActiveStepIndex(0)
  }, [])

  const nextStep = useCallback(() => {
    if (!activeWalkthrough) return
    setActiveStepIndex((i) => {
      const next = Math.min(activeWalkthrough.steps.length - 1, i + 1)
      const step = activeWalkthrough.steps[next]
      if (step?.page) setPage(step.page)
      return next
    })
  }, [activeWalkthrough])

  const prevStep = useCallback(() => {
    if (!activeWalkthrough) return
    setActiveStepIndex((i) => {
      const prev = Math.max(0, i - 1)
      const step = activeWalkthrough.steps[prev]
      if (step?.page) setPage(step.page)
      return prev
    })
  }, [activeWalkthrough])

  const goToStep = useCallback(
    (idx: number) => {
      if (!activeWalkthrough) return
      const clamped = Math.max(0, Math.min(activeWalkthrough.steps.length - 1, idx))
      setActiveStepIndex(clamped)
      const step = activeWalkthrough.steps[clamped]
      if (step?.page) setPage(step.page)
    },
    [activeWalkthrough],
  )

  const openHelp = useCallback((topicId: string) => setOpenHelpTopicId(topicId), [])
  const closeHelp = useCallback(() => setOpenHelpTopicId(null), [])

  const value: DapApi = {
    content,
    page,
    assistModeEnabled,
    activeWalkthrough,
    activeStepIndex,
    activeStep,
    isWalkthroughOpen: Boolean(activeWalkthrough),
    openHelpTopicId,
    setPage,
    setAssistModeEnabled,
    startWalkthrough,
    endWalkthrough,
    nextStep,
    prevStep,
    goToStep,
    openHelp,
    closeHelp,
  }

  return <DapContext.Provider value={value}>{children}</DapContext.Provider>
}

