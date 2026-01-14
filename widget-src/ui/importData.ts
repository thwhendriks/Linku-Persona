/**
 * Import Data UI - HTML template for import JSON modal
 */

import type { Language } from '../types'
import { getStrings } from '../strings'

export interface ImportDataOptions {
  language: Language
}

export function getImportDataHTML(options: ImportDataOptions): string {
  const STRINGS = getStrings(options.language)
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; }
    h3 { font-size: 14px; margin-bottom: 16px; color: #1f2937; }
    textarea { width: 100%; height: 200px; padding: 12px; margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; font-family: monospace; resize: none; }
    textarea:focus { outline: none; border-color: #2D6BFB; }
    button { width: 100%; padding: 12px; background: #2D6BFB; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    button:hover { background: #1E5BD9; }
    .hint { font-size: 11px; color: #9ca3af; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h3>${STRINGS.importTitle}</h3>
  <p class="hint">${STRINGS.importHint}</p>
  <textarea id="data" placeholder='${STRINGS.importPlaceholder}'></textarea>
  <button id="submit">${STRINGS.importButton}</button>
  <script>
    document.getElementById('submit').onclick = () => {
      const data = document.getElementById('data').value.trim()
      if (data) {
        parent.postMessage({ pluginMessage: { type: 'importData', data } }, '*')
      }
    }
  </script>
</body>
</html>`
}

export const IMPORT_DATA_SIZE = { width: 320, height: 340 }
