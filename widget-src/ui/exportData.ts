/**
 * Export Data UI - HTML template for export JSON modal
 */

import type { Language } from '../types'
import { getStrings } from '../strings'

export interface ExportDataOptions {
  language: Language
}

export function getExportDataHTML(options: ExportDataOptions): string {
  const STRINGS = getStrings(options.language)
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Inter, sans-serif; padding: 16px; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; }
      h3 { font-size: 14px; margin: 0 0 12px 0; font-weight: 600; color: #374151; }
      button { background: #2D6BFB; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; margin-top: 8px; }
      button:hover { background: #1E5BD9; }
      p { font-size: 11px; color: #6B7280; margin: 8px 0; line-height: 1.4; }
      textarea { 
        font-family: 'Roboto Mono', monospace; 
        font-size: 11px; 
        padding: 8px; 
        border: 1px solid #E5E7EB; 
        border-radius: 6px; 
        width: 100%; 
        flex: 1; 
        resize: none; 
        background: #F9FAFB;
        margin-top: 8px;
      }
      textarea:focus { outline: none; border-color: #2D6BFB; }
      .hidden { display: none; }
      .success { color: #059669; font-weight: 600; }
      .error { color: #DC2626; }
      .container { display: flex; flex-direction: column; width: 100%; height: 100%; }
      #initial-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
      #manual-state { display: none; flex-direction: column; height: 100%; width: 100%; }
    </style>
  </head>
  <body>
    <div id="initial-state">
      <div id="status">${STRINGS.exportLoading}</div>
    </div>

    <div id="manual-state">
      <h3>${STRINGS.exportTitle}</h3>
      <p>${STRINGS.exportManualHint}</p>
      <textarea id="data" readonly></textarea>
      <button id="closeBtn">${STRINGS.close}</button>
    </div>

    <script>
      const status = document.getElementById('status');
      const initialState = document.getElementById('initial-state');
      const manualState = document.getElementById('manual-state');
      const dataArea = document.getElementById('data');
      const closeBtn = document.getElementById('closeBtn');

      window.parent.postMessage({ pluginMessage: { type: 'uiReady' } }, '*');

      window.onmessage = async (event) => {
        const msg = event.data.pluginMessage;
        if (msg && msg.type === 'exportPayload') {
          status.innerText = '${STRINGS.exportCopying}';
          dataArea.value = msg.data;
          await attemptCopy();
        }
      }

      function copySuccess() {
        status.className = 'success';
        status.innerText = '${STRINGS.exportCopied}';
        setTimeout(() => {
          window.parent.postMessage({ pluginMessage: { type: 'exportComplete' } }, '*');
        }, 800);
      }

      function showManual() {
        initialState.style.display = 'none';
        manualState.style.display = 'flex';
        dataArea.select();
      }

      async function attemptCopy() {
        try {
          dataArea.select();
          const success = document.execCommand('copy');
          if (success) {
              copySuccess();
              return;
          }
          throw new Error('execCommand failed');
        } catch (e) {
          if (navigator.clipboard) {
              try {
                  await navigator.clipboard.writeText(dataArea.value);
                  copySuccess();
              } catch (err) {
                  showManual();
              }
          } else {
              showManual();
          }
        }
      }

      closeBtn.onclick = () => {
        window.parent.postMessage({ pluginMessage: { type: 'exportComplete' } }, '*');
      };
    </script>
  </body>
</html>`
}

export const EXPORT_DATA_SIZE = { width: 400, height: 350 }
