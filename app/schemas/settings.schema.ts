import { z } from '@hono/zod-openapi'
import {
  AccentColor,
  Animations,
  BoardBackgroundBlur,
  CardDensity,
  DateFormat,
  DefaultDeadline,
  FontSize,
  LabelDisplay,
  Priority,
  Theme,
  WeekStart
} from '@prisma/client'

import { ObjectIdSchema } from './object-id.schema'

export const AccentColorSchema = z.enum(AccentColor).openapi('AccentColor')

export const GeneralSettingsSchema = z
  .object({
    theme: z.enum(Theme).openapi({ default: Theme.light }),
    accentColor: AccentColorSchema.openapi({ default: AccentColor.green }),
    firstDayOfWeek: z.enum(WeekStart).openapi({ example: WeekStart.monday }),
    fontSize: z.enum(FontSize).openapi({ example: FontSize.medium }),
    dateFormat: z.enum(DateFormat).openapi({ example: DateFormat.dd_mm_yyyy }),
    boardBackgroundBlur: z
      .enum(BoardBackgroundBlur)
      .openapi({ example: BoardBackgroundBlur.off }),
    enableAnimations: z.enum(Animations).openapi({
      description:
        '`system` defers to the client `prefers-reduced-motion` media query',
      example: Animations.system
    }),
    confirmBeforeDelete: z.boolean().openapi({ example: true })
  })
  .openapi('GeneralSettings')

export const TaskSettingsSchema = z
  .object({
    defaultPriority: z.enum(Priority).openapi({ example: Priority.without }),
    defaultDeadline: z
      .enum(DefaultDeadline)
      .openapi({ example: DefaultDeadline.none }),
    cardDensity: z.enum(CardDensity).openapi({ example: CardDensity.compact }),
    showPriorityIndicator: z.boolean().openapi({ example: true }),
    overdueHighlight: z.boolean().openapi({ example: true })
  })
  .openapi('TaskSettings')

export const LabelSettingsSchema = z
  .object({
    labelDisplay: z.enum(LabelDisplay).openapi({ example: LabelDisplay.full }),
    maxLabelsShown: z.number().int().min(0).max(10).openapi({
      description: 'Labels rendered on a task card before collapsing. 0 = all',
      example: 3
    })
  })
  .openapi('LabelSettings')

export const UserSettingsSchema = z
  .object({
    id: ObjectIdSchema,
    general: GeneralSettingsSchema,
    task: TaskSettingsSchema,
    label: LabelSettingsSchema,
    userId: ObjectIdSchema
  })
  .openapi('UserSettings')

export const UpdateGeneralSettingsSchema = GeneralSettingsSchema.partial()

export const UpdateTaskSettingsSchema = TaskSettingsSchema.partial()

export const UpdateLabelSettingsSchema = LabelSettingsSchema.partial()
