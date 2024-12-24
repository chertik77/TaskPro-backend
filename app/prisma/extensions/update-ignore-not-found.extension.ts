import { Prisma } from '@prisma/client'

export const updateIgnoreNotFoundExtension = Prisma.defineExtension(client => {
  return client.$extends({
    name: 'updateIgnoreNotFound',
    model: {
      $allModels: {
        async updateIgnoreNotFound<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'update'>>
        ): Promise<Prisma.Result<T, A, 'update'> | null> {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const context = Prisma.getExtensionContext(this) as any
            return await context.update(args)
          } catch (err) {
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === 'P2025'
            ) {
              return null
            }
            throw err
          }
        }
      }
    }
  })
})
