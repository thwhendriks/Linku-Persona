/**
 * Settings UI - HTML template for widget field settings modal
 */

import type { WidgetSettings, Language } from '../types'
import { getStrings } from '../strings'

export interface SettingsOptions {
  settings: WidgetSettings
  language: Language
}

export function getSettingsHTML(options: SettingsOptions): string {
  const { settings, language } = options
  const STRINGS = getStrings(language)
  const settingsJson = JSON.stringify(settings).replace(/'/g, "\\'")
  const currentLanguage = language

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; overflow-y: auto; height: 100vh; }
    h3 { font-size: 16px; margin-bottom: 6px; color: #1f2937; font-weight: 600; }
    .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
    input[type="text"] { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: Inter, -apple-system, sans-serif; }
    input[type="text"]:focus { outline: none; border-color: #2D6BFB; }
    input[type="text"]::placeholder { color: #9ca3af; }
    .field-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .field-item { display: flex; gap: 8px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; transition: border-color 0.15s; }
    .field-item:hover { border-color: #d1d5db; }
    .field-item.builtin { background: #fffbeb; border-color: #fef08a; }
    .field-item.hidden { opacity: 0.5; }
    .visibility-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer; border-radius: 6px; transition: all 0.15s; border: 1px solid #e5e7eb; background: #fff; flex-shrink: 0; }
    .visibility-btn:hover { background: #f9fafb; border-color: #d1d5db; }
    .visibility-btn svg { width: 16px; height: 16px; }
    .field-label-input { flex: 1; font-weight: 500; min-width: 0; }
    .builtin-badge { font-size: 9px; background: #fef3c7; color: #92400e; padding: 2px 5px; border-radius: 3px; font-weight: 600; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.3px; }
    .field-controls { display: flex; gap: 2px; flex-shrink: 0; }
    .move-btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #6b7280; }
    .move-btn:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
    .move-btn:disabled { opacity: 0.25; cursor: not-allowed; }
    .move-btn svg { width: 12px; height: 12px; }
    .delete-btn { background: #fff; border: 1px solid #fecaca; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #dc2626; }
    .delete-btn:hover { background: #fef2f2; border-color: #fca5a5; }
    .delete-btn svg { width: 12px; height: 12px; }
    .add-field-btn { width: 100%; padding: 10px; background: #f9fafb; color: #374151; border: 2px dashed #d1d5db; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .add-field-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
    .buttons { display: flex; gap: 8px; margin-top: 20px; }
    .buttons button { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .cancel-btn { background: #F3F4F6; color: #374151; }
    .cancel-btn:hover { background: #E5E7EB; }
    .save-btn { background: #2D6BFB; color: white; }
    .save-btn:hover { background: #1E5BD9; }
    .section-divider { height: 1px; background: #e5e7eb; margin: 16px 0; }
    .language-section { margin-bottom: 16px; }
    .language-label { font-size: 11px; font-weight: 500; color: #6b7280; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .language-select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: Inter, -apple-system, sans-serif; background: #fff; cursor: pointer; }
    .language-select:focus { outline: none; border-color: #2D6BFB; }
  </style>
</head>
<body>
  <div class="language-section">
    <label class="language-label">${STRINGS.languageLabel}</label>
    <select id="languageSelect" class="language-select">
      <option value="en" ${currentLanguage === 'en' ? 'selected' : ''}>${STRINGS.languageEnglish}</option>
      <option value="nl" ${currentLanguage === 'nl' ? 'selected' : ''}>${STRINGS.languageDutch}</option>
    </select>
  </div>
  
  <div class="section-divider"></div>
  
  <h3>${STRINGS.settingsTitle}</h3>
  <p class="subtitle">${STRINGS.settingsSubtitle}</p>
  
  <div id="fieldList" class="field-list"></div>
  <button type="button" class="add-field-btn" id="addFieldBtn">${STRINGS.addField}</button>
  
  <div class="buttons">
    <button type="button" class="cancel-btn" id="cancelBtn">${STRINGS.cancel}</button>
    <button type="button" class="save-btn" id="saveBtn">${STRINGS.save}</button>
  </div>
  
  <script>
    const settingsJson = '${settingsJson}';
    let settings;
    try {
      settings = JSON.parse(settingsJson);
    } catch(e) {
      console.error('Failed to parse settings:', e);
      settings = { fields: [] };
    }
    
    const eyeOpenSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const eyeClosedSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    const arrowUpSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
    const arrowDownSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    const trashSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    
    function renderFields() {
      const list = document.getElementById('fieldList');
      list.innerHTML = '';
      
      const sortedFields = [...settings.fields].sort((a, b) => a.order - b.order);
      
      sortedFields.forEach((field, index) => {
        const item = document.createElement('div');
        item.className = 'field-item' + (field.isBuiltIn ? ' builtin' : '') + (field.isVisible ? '' : ' hidden');
        
        const visBtn = document.createElement('button');
        visBtn.type = 'button';
        visBtn.className = 'visibility-btn';
        visBtn.innerHTML = field.isVisible ? eyeOpenSvg : eyeClosedSvg;
        visBtn.title = field.isVisible ? '${STRINGS.hideField}' : '${STRINGS.showField}';
        visBtn.onclick = () => {
          field.isVisible = !field.isVisible;
          renderFields();
        };
        item.appendChild(visBtn);
        
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = field.label || '';
        labelInput.placeholder = '${STRINGS.fieldNamePlaceholder}';
        labelInput.className = 'field-label-input';
        labelInput.oninput = (e) => { field.label = e.target.value; };
        item.appendChild(labelInput);
        
        if (field.isBuiltIn) {
          const badge = document.createElement('span');
          badge.className = 'builtin-badge';
          badge.textContent = '${STRINGS.builtInBadge}';
          item.appendChild(badge);
        }
        
        const controls = document.createElement('div');
        controls.className = 'field-controls';
        
        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'move-btn';
        upBtn.innerHTML = arrowUpSvg;
        upBtn.disabled = index === 0;
        upBtn.onclick = () => {
          if (index > 0) {
            const temp = sortedFields[index - 1].order;
            sortedFields[index - 1].order = field.order;
            field.order = temp;
            renderFields();
          }
        };
        controls.appendChild(upBtn);
        
        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'move-btn';
        downBtn.innerHTML = arrowDownSvg;
        downBtn.disabled = index === sortedFields.length - 1;
        downBtn.onclick = () => {
          if (index < sortedFields.length - 1) {
            const temp = sortedFields[index + 1].order;
            sortedFields[index + 1].order = field.order;
            field.order = temp;
            renderFields();
          }
        };
        controls.appendChild(downBtn);
        
        if (!field.isBuiltIn) {
          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'delete-btn';
          delBtn.innerHTML = trashSvg;
          delBtn.onclick = () => {
            if (confirm('${STRINGS.deleteFieldConfirm}')) {
              settings.fields = settings.fields.filter(f => f.id !== field.id);
              renderFields();
            }
          };
          controls.appendChild(delBtn);
        }
        
        item.appendChild(controls);
        list.appendChild(item);
      });
    }
    
    document.getElementById('addFieldBtn').onclick = () => {
      const maxOrder = Math.max(...settings.fields.map(f => f.order), -1);
      settings.fields.push({
        id: 'custom-' + Date.now(),
        label: '',
        isBuiltIn: false,
        isVisible: true,
        order: maxOrder + 1
      });
      renderFields();
      setTimeout(() => {
        const inputs = document.querySelectorAll('.field-label-input');
        if (inputs.length) inputs[inputs.length - 1].focus();
      }, 50);
    };
    
    document.getElementById('cancelBtn').onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'cancelSettings' } }, '*');
    };
    
    document.getElementById('saveBtn').onclick = () => {
      const language = document.getElementById('languageSelect').value;
      parent.postMessage({ pluginMessage: { type: 'updateSettings', settings: settings, language: language } }, '*');
    };
    
    renderFields();
  </script>
</body>
</html>`
}

export const SETTINGS_SIZE = { width: 380, height: 500 }
