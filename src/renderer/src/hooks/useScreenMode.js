import { useEffect, useState } from 'react'

export function useScreenMode() {
  // hitung mode sebelum render pertama (anti-kedut)
  const getMode = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 0
    if (w >= 2400) return 'ultra'
    if (w >= 1900) return 'wide'
    return 'default'
  }

  const [mode, setMode] = useState(getMode)

  useEffect(() => {
    const onResize = () => setMode(getMode())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return mode
}
