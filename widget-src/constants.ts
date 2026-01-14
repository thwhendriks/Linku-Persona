/**
 * Constants and Design Tokens for Linku Persona Widget
 */

import type { ColorKey, ColorScheme, Category, FieldConfig, TasksModuleConfig } from './types'

export const COLORS: Record<ColorKey, ColorScheme> = {
  pink: {
    bg: '#FDF2F8',
    bgLight: '#FDF2F8',
    accent: '#DB2777',
    text: '#9D174D',
    border: '#F9A8D4',
  },
  teal: {
    bg: '#F0FDFA',
    bgLight: '#F0FDFA',
    accent: '#0D9488',
    text: '#115E59',
    border: '#5EEAD4',
  },
  purple: {
    bg: '#FAF5FF',
    bgLight: '#FAF5FF',
    accent: '#7C3AED',
    text: '#6B21A8',
    border: '#D8B4FE',
  },
  amber: {
    bg: '#FFFBEB',
    bgLight: '#FFFBEB',
    accent: '#B45309',
    text: '#92400E',
    border: '#FCD34D',
  },
  sky: {
    bg: '#F0F9FF',
    bgLight: '#F0F9FF',
    accent: '#0284C7',
    text: '#075985',
    border: '#7DD3FC',
  },
  rose: {
    bg: '#FFF1F2',
    bgLight: '#FFF1F2',
    accent: '#E11D48',
    text: '#9F1239',
    border: '#FDA4AF',
  },
  indigo: {
    bg: '#EEF2FF',
    bgLight: '#EEF2FF',
    accent: '#4F46E5',
    text: '#3730A3',
    border: '#A5B4FC',
  },
  emerald: {
    bg: '#ECFDF5',
    bgLight: '#ECFDF5',
    accent: '#059669',
    text: '#065F46',
    border: '#6EE7B7',
  },
  gray: {
    bg: '#F9FAFB',
    bgLight: '#F9FAFB',
    accent: '#4B5563',
    text: '#1F2937',
    border: '#D1D5DB',
  },
}

export const DEFAULT_CATEGORIES: Category[] = []

export const DEFAULT_FIELD_CONFIG: FieldConfig[] = [
  { id: 'quote', label: 'Quote', isBuiltIn: true, builtInKey: 'quote', isVisible: true, order: 0 },
  { id: 'context', label: 'Context', isBuiltIn: true, builtInKey: 'context', isVisible: true, order: 1 },
  { id: 'description', label: 'Omschrijving', isBuiltIn: true, builtInKey: 'description', isVisible: true, order: 2 },
  { id: 'tasks', label: 'Taken', isBuiltIn: true, builtInKey: 'tasks', isVisible: true, order: 3 },
]

// Legacy support - kept for backwards compatibility
export const DEFAULT_TASKS_MODULE: TasksModuleConfig = {
  isVisible: true,
  label: 'Taken'
}
