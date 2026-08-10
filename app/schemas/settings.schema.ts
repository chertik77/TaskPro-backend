import { z } from '@hono/zod-openapi'
import {
  AccentColor,
  BoardBackgroundBlur,
  CardDensity,
  DateFormat,
  DefaultDeadline,
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

export const GetAllSettingsResponseSchema = z.object({
  general: GeneralSettingsSchema,
  task: TaskSettingsSchema,
  label: LabelSettingsSchema
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
