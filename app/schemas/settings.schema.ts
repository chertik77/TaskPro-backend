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
import * as z from 'zod'

export const UpdateGeneralSettingsSchema = z.object({
  theme: z.enum(Theme).optional(),
  accentColor: z.enum(AccentColor).optional(),
  firstDayOfWeek: z.enum(WeekStart).optional(),
  dateFormat: z.enum(DateFormat).optional(),
  boardBackgroundBlur: z.enum(BoardBackgroundBlur).optional(),
  usePointerCursors: z.boolean().optional(),
  enableAnimations: z.boolean().optional(),
  confirmBeforeDelete: z.boolean().optional()
})

export const UpdateTaskSettingsSchema = z.object({
  sortTasksBy: z.enum(TaskSort).optional(),
  defaultPriority: z.enum(Priority).optional(),
  defaultDeadline: z.enum(DefaultDeadline).optional(),
  cardDensity: z.enum(CardDensity).optional(),
  showCompletedTasks: z.boolean().optional(),
  newTaskPosition: z.enum(NewTaskPosition).optional(),
  naturalLanguageDates: z.boolean().optional()
})

export const UpdateLabelSettingsSchema = z.object({
  showLabelsOnCard: z.boolean().optional(),
  labelDisplay: z.enum(LabelDisplay).optional(),
  maxLabelShown: z.enum(MaxLabelsShown).optional()
})

export const UpdateaccessibilitySettingsSchema = z.object({
  reducedMotion: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  focusIndicators: z.boolean().optional(),
  keyboardNavigationHints: z.boolean().optional(),
  fontSize: z.enum(FontSize).optional()
})
