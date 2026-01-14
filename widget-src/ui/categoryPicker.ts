/**
 * Category Picker UI - HTML template for profile category selection modal
 */

import type { Category, Language } from '../types'
import { getStrings } from '../strings'

export interface CategoryPickerOptions {
  profileId: string
  currentCategoryId: string
  categories: Category[]
  language: Language
}

export function getCategoryPickerHTML(options: CategoryPickerOptions): string {
  const { profileId, currentCategoryId, categories, language } = options
  const STRINGS = getStrings(language)
  
  const categoryOptions = [
    `<option value="" ${currentCategoryId === '' ? 'selected' : ''}>${STRINGS.noCategory}</option>`,
    ...categories.map(cat =>
      `<option value="${cat.id}" ${currentCategoryId === cat.id ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
    )
  ].join('')

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; }
    h3 { font-size: 14px; margin-bottom: 16px; color: #1f2937; }
    label { display: block; font-size: 11px; font-weight: 500; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    select { width: 100%; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
    select:focus { outline: none; border-color: #2D6BFB; }
    button { width: 100%; padding: 12px; background: #2D6BFB; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    button:hover { background: #1E5BD9; }
  </style>
</head>
<body>
  <h3>${STRINGS.categoryPickerTitle}</h3>
  <input type="hidden" id="profileId" value="${profileId}">
  <label>${STRINGS.categoryPickerLabel}</label>
  <select id="categoryId">${categoryOptions}</select>
  <button id="submit">${STRINGS.save}</button>
  <script>
    document.getElementById('submit').onclick = () => {
      const profileId = document.getElementById('profileId').value
      const categoryId = document.getElementById('categoryId').value
      parent.postMessage({ pluginMessage: { type: 'updateProfileCategory', profileId, categoryId } }, '*')
    }
    document.getElementById('categoryId').focus()
  </script>
</body>
</html>`
}

export const CATEGORY_PICKER_SIZE = { width: 280, height: 200 }
