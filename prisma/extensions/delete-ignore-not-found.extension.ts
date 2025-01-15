import { Prisma } from '@prisma/client'

export const deleteIgnoreNotFoundExtension = Prisma.defineExtension(client => {
  return client.$extends({
    name: 'deleteIgnoreNotFound',
    model: {
      $allModels: {
        async deleteIgnoreNotFound<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'delete'>>
        ): Promise<Prisma.Result<T, A, 'delete'> | null> {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const context = Prisma.getExtensionContext(this) as any
            return await context.delete(args)
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
