export type WalkthroughPlacement = 'top' | 'right' | 'bottom' | 'left' | 'auto'

export type MissingTargetBehavior = 'centered' | 'skip'

export type AppPageId = 'dashboard' | 'customers' | 'campaigns' | 'settings' | 'onboarding'

export type WalkthroughStep = {
  id: string
  title: string
  body: string
  target: string
  placement?: WalkthroughPlacement
  page?: AppPageId
  missingTargetBehavior?: MissingTargetBehavior
}

export type Walkthrough = {
  id: string
  name: string
  description?: string
  steps: WalkthroughStep[]
}

export type HelpTopic = {
  id: string
  title: string
  summary: string
  showMeHowWalkthroughId?: string
  readMore?: string[]
}

export type AssistField = {
  id: string
  label: string
  hint: string
  example?: string
  readMore?: string[]
  showMeHowWalkthroughId?: string
}

export type AssistForm = {
  id: string
  name: string
  idlePromptMs?: number
  stuckNudgeMs?: number
  fields: Record<string, AssistField>
}

export type AssistContent = {
  forms: Record<string, AssistForm>
}

export type DapContent = {
  walkthroughs: Record<string, Walkthrough>
  helpTopics: Record<string, HelpTopic>
  assist: AssistContent
}

