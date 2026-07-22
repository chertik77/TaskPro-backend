import type { auth } from '@/lib'

export type Variables = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
}
