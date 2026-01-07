import { useContext } from 'react'
import { DapContext } from './context'

export function useDap() {
  const ctx = useContext(DapContext)
  if (!ctx) {
    throw new Error('useDap must be used within <DapProvider>')
  }
  return ctx
}

