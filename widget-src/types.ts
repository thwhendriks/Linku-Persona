/**
 * TypeScript interfaces for Linku Persona Widget
 */

export interface Profile {
  id: string
  name: string
  categoryId: string  // Empty string = uncategorized
  description: string
  quote: string
  tasks: string[]
  context: string
  customFields?: Record<string, string>  // fieldId -> value
}

export interface Category {
  id: string
  name: string
  icon: string
  colorKey: ColorKey
  order: number
}

export type ColorKey = 'pink' | 'teal' | 'purple' | 'amber' | 'sky' | 'rose' | 'indigo' | 'emerald' | 'gray'

// Language options for i18n
export type Language = 'en' | 'nl'

export interface ColorScheme {
  bg: string
  bgLight: string
  accent: string
  text: string
  border: string
}

// Field configuration (stored globally)
export interface FieldConfig {
  id: string
  label: string
  isBuiltIn: boolean        // true for quote, context, description, tasks
  builtInKey?: 'quote' | 'context' | 'description' | 'tasks'
  isVisible: boolean
  order: number
}

// Global widget settings (simplified)
export interface WidgetSettings {
  fields: FieldConfig[]
}

// Legacy support for tasksModule (backwards compatibility)
export interface TasksModuleConfig {
  isVisible: boolean
  label: string
}
