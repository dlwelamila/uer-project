'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HealthIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/health/code-currency')
  }, [router])

  return null
}
