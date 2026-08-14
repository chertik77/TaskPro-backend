import type { auth } from '@/lib'

export type AuthVariables = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
}
