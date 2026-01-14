/**
 * Utility functions for Linku Persona Widget
 */

import type { Profile, FieldConfig } from './types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Get field value from profile (built-in or custom)
 * Note: 'tasks' is handled separately, not through this function
 */
export function getFieldValue(profile: Profile, fieldConfig: FieldConfig): string {
  if (fieldConfig.isBuiltIn && fieldConfig.builtInKey && fieldConfig.builtInKey !== 'tasks') {
    return profile[fieldConfig.builtInKey] || ''
  }
  return profile.customFields?.[fieldConfig.id] || ''
}

/**
 * Set field value in profile (built-in or custom)
 * Note: 'tasks' is handled separately, not through this function
 */
export function setFieldValue(profile: Profile, fieldConfig: FieldConfig, value: string): Profile {
  if (fieldConfig.isBuiltIn && fieldConfig.builtInKey && fieldConfig.builtInKey !== 'tasks') {
    return { ...profile, [fieldConfig.builtInKey]: value }
  }
  return {
    ...profile,
    customFields: { ...(profile.customFields || {}), [fieldConfig.id]: value }
  }
}

/**
 * Get the next profile number based on existing profiles
 */
export function getNextProfileNumber(profiles: { values(): Iterable<Profile> }): number {
  const numbers = Array.from(profiles.values()).map(p => {
    const match = p.id.match(/profile-(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  })
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1
}
