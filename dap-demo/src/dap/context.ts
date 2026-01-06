import { createContext } from 'react'
import type { DapApi } from './DapProvider'

export const DapContext = createContext<DapApi | null>(null)

