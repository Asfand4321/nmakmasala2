import type { AdminUser } from './useChildAccounts'

export function hasPerm(user: AdminUser | null, path: string): boolean {
  if (!user || !user.enabled) return false
  if (user.role === 'owner') return true
  // path like "orders.view" or "payments.refund"
  const [area, action] = path.split('.')
  const node: any = (user.permissions as any)[area]
  return !!(node && node[action])
}
