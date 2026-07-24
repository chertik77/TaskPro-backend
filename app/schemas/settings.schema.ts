import { z } from '@hono/zod-openapi'
import {
  AccentColor,
  BoardBackgroundBlur,
  CardDensity,
  DateFormat,
  DefaultDeadline,
  FontSize,
  LabelDisplay,
  MaxLabelsShown,
  NewTaskPosition,
  Priority,
  TaskSort,
  Theme,
  WeekStart
} from '@prisma/client'

import { ObjectIdSchema } from './object-id.schema'

export const AccentColorSchema = z.enum(AccentColor).openapi('AccentColor')

export const GeneralSettingsSchema = z
  .object({
    id: ObjectIdSchema,
    theme: z.enum(Theme).openapi({ default: Theme.light }),
    accentColor: AccentColorSchema.openapi({ default: AccentColor.blue }),
    firstDayOfWeek: z.enum(WeekStart).openapi({ example: WeekStart.monday }),
    dateFormat: z.enum(DateFormat).openapi({ example: DateFormat.dd_mm_yyyy }),
    boardBackgroundBlur: z
      .enum(BoardBackgroundBlur)
      .openapi({ example: BoardBackgroundBlur.off }),
    usePointerCursors: z.boolean().openapi({ example: true }),
    enableAnimations: z.boolean().openapi({ example: true }),
    confirmBeforeDelete: z.boolean().openapi({ example: true }),
    userId: ObjectIdSchema
  })
  .openapi('GeneralSettings')

export const TaskSettingsSchema = z
  .object({
    id: ObjectIdSchema,
    sortTasksBy: z.enum(TaskSort).openapi({ example: TaskSort.manual }),
    defaultPriority: z.enum(Priority).openapi({ example: Priority.without }),
    defaultDeadline: z
      .enum(DefaultDeadline)
      .openapi({ example: DefaultDeadline.none }),
    cardDensity: z.enum(CardDensity).openapi({ example: CardDensity.compact }),
    showCompletedTasks: z.boolean().openapi({ example: true }),
    showPriorityIndicator: z.boolean().openapi({ example: true }),
    newTaskPosition: z
      .enum(NewTaskPosition)
      .openapi({ example: NewTaskPosition.bottom }),
    enableNaturalLanguageDates: z.boolean().openapi({ example: true }),
    userId: ObjectIdSchema
  })
  .openapi('TaskSettings')

export const LabelSettingsSchema = z
  .object({
    id: ObjectIdSchema,
    showLabelsOnTask: z.boolean().openapi({ example: true }),
    labelDisplay: z.enum(LabelDisplay).openapi({ example: LabelDisplay.full }),
    maxLabelsShown: z
      .enum(MaxLabelsShown)
      .openapi({ example: MaxLabelsShown.three }),
    userId: ObjectIdSchema
  })
  .openapi('LabelSettings')

export const AccessibilitySettingsSchema = z
  .object({
    id: ObjectIdSchema,
    fontSize: z.enum(FontSize).openapi({ example: FontSize.medium }),
    reducedMotion: z.boolean().openapi({ example: false }),
    highContrast: z.boolean().openapi({ example: false }),
    focusIndicators: z.boolean().openapi({ example: true }),
    keyboardNavigationHints: z.boolean().openapi({ example: false }),
    userId: ObjectIdSchema
  })
  .openapi('AccessibilitySettings')

export const GetAllSettingsResponseSchema = z.object({
  general: GeneralSettingsSchema,
  task: TaskSettingsSchema,
  label: LabelSettingsSchema,
  accessibility: AccessibilitySettingsSchema
})

export const UpdateGeneralSettingsSchema = GeneralSettingsSchema.omit({
  id: true,
  userId: true
}).partial()

export const UpdateTaskSettingsSchema = TaskSettingsSchema.omit({
  id: true,
  userId: true
}).partial()

export const UpdateLabelSettingsSchema = LabelSettingsSchema.omit({
  id: true,
  userId: true
}).partial()

export const UpdateAccessibilitySettingsSchema =
  AccessibilitySettingsSchema.omit({
    id: true,
    userId: true
  }).partial()
