import type { core } from 'zod'

export const zodConfig: core.$ZodConfig = {
  customError: ({
    input,
    code,
    minimum,
    maximum,
    expected,
    format,
    values
  }) => {
    if (!input) return 'The field is required'

    if (code === 'too_small') {
      return `The field must be at least ${minimum} characters`
    }

    if (code === 'too_big') {
      return `The field must be at most ${maximum} characters`
    }

    if (code === 'invalid_value') {
      return `The field must be one of the following values: ${values.join(', ')}`
    }

    if (code === 'invalid_format') {
      return `The field must have a valid ${format} format`
    }

    if (code === 'invalid_type') return `The field must be of type ${expected}`

    return undefined
  }
}
