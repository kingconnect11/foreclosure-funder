'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type KeyboardShortcutsProps = {
  isAdmin?: boolean
}

export function KeyboardShortcuts({ isAdmin = false }: KeyboardShortcutsProps) {
  const router = useRouter()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable
      if (isInput) return

      // Escape — close modal/dropdown (dispatch custom event for any listener)
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('keyboard-escape'))
        return
      }

      // / — focus search (dashboard)
      if (e.key === '/') {
        e.preventDefault()
        const search = document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[placeholder*="search"]')
        if (search) {
          search.focus()
        }
        return
      }

      // g then d / p / a — navigation
      if (e.key === 'g') {
        e.preventDefault()
        const handler = (e2: KeyboardEvent) => {
          if (e2.key === 'd') {
            e2.preventDefault()
            router.push('/dashboard')
          } else if (e2.key === 'p') {
            e2.preventDefault()
            router.push('/pipeline')
          } else if (e2.key === 'a' && isAdmin) {
            e2.preventDefault()
            router.push('/admin')
          }
          document.removeEventListener('keydown', handler)
        }
        document.addEventListener('keydown', handler)
        setTimeout(() => document.removeEventListener('keydown', handler), 1000)
        return
      }
    },
    [router, isAdmin]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return null
}
