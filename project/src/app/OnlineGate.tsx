import type { ReactElement, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isOnlineConfigured } from '@/lib/room/online'

export function OnlineGate({
  children,
}: {
  children: ReactNode
}): ReactElement {
  return isOnlineConfigured() ? (
    <>{children}</>
  ) : (
    <Navigate to="/home" replace />
  )
}
