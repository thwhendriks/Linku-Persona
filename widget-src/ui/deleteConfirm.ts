/**
 * Delete Confirmation UI - HTML template for delete confirmation modal
 */

import type { Language } from '../types'
import { getStrings } from '../strings'

export interface DeleteConfirmOptions {
  type: 'profile' | 'category'
  id: string
  name: string
  profileCount?: number
  language: Language
}

export function getDeleteConfirmHTML(options: DeleteConfirmOptions): string {
  const { type, id, name, profileCount, language } = options
  const STRINGS = getStrings(language)
  
  const title = type === 'profile' ? STRINGS.deleteProfileTitle : STRINGS.deleteCategoryTitle
  
  let message = ''
  if (type === 'profile') {
    message = STRINGS.deleteProfileMessage(name)
  } else {
    if (profileCount && profileCount > 0) {
      message = STRINGS.deleteCategoryWithProfiles(name, profileCount)
    } else {
      message = STRINGS.deleteCategoryMessage(name)
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; }
    h3 { font-size: 14px; margin-bottom: 12px; color: #1f2937; font-weight: 600; }
    p { font-size: 13px; color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
    .buttons { display: flex; gap: 8px; }
    button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .cancel { background: #F3F4F6; color: #374151; }
    .cancel:hover { background: #E5E7EB; }
    .delete { background: #EF4444; color: white; }
    .delete:hover { background: #DC2626; }
  </style>
</head>
<body>
  <h3>${title}</h3>
  <p>${message}</p>
  <input type="hidden" id="id" value="${id}">
  <input type="hidden" id="type" value="${type}">
  <div class="buttons">
    <button class="cancel" id="cancel">${STRINGS.cancel}</button>
    <button class="delete" id="delete">${STRINGS.delete}</button>
  </div>
  <script>
    document.getElementById('cancel').onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'cancelDelete' } }, '*')
    }
    document.getElementById('delete').onclick = () => {
      const id = document.getElementById('id').value
      const deleteType = document.getElementById('type').value
      parent.postMessage({ pluginMessage: { type: 'confirmDelete', deleteType, id } }, '*')
    }
    document.getElementById('cancel').focus()
  </script>
</body>
</html>`
}

export const DELETE_CONFIRM_SIZE = { width: 320, height: 240 }
