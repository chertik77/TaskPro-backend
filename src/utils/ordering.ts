export const ORDER_STEP = 1024
export const MIN_ORDER_GAP = 0.000001

type Neighbours = {
  prev?: { order: number }
  next?: { order: number }
}

export const getOrderBetween = ({ prev, next }: Neighbours) => {
  if (prev && next) {
    if (next.order - prev.order < MIN_ORDER_GAP) return null

    return (prev.order + next.order) / 2
  }

  if (prev) return prev.order + ORDER_STEP

  if (next) return next.order - ORDER_STEP

  return 0
}

export const getRebalancedOrder = (index: number) => index * ORDER_STEP
