/**
 * Category Form UI - HTML template for add/edit category modal
 */

import type { Category } from '../types'
import { STRINGS } from '../strings'

export interface CategoryFormOptions {
  initialData?: Category
}

export function getCategoryFormHTML(options: CategoryFormOptions = {}): string {
  const { initialData } = options
  
  // Curated emoji presets organized by domain
  const emojiPresets = [
    // Office/Work
    '👤', '👥', '💼', '📊', '📈', '🗂️',
    // IT/Tech
    '💻', '🖥️', '⚙️', '🔧', '🔒', '📱',
    // Healthcare
    '🏥', '⚕️', '💉', '🩺', '❤️', '🧬',
    // Status/General
    '✅', '⭐', '🎯', '📌', '🔔', '💡',
  ]

  const presetButtons = emojiPresets.map(emoji =>
    `<button type="button" class="preset-btn" data-emoji="${emoji}">${emoji}</button>`
  ).join('')

  // Color swatches with accent colors
  const colorSwatches = [
    { key: 'pink', color: '#DB2777', name: 'Pink' },
    { key: 'teal', color: '#0D9488', name: 'Teal' },
    { key: 'purple', color: '#7C3AED', name: 'Purple' },
    { key: 'amber', color: '#B45309', name: 'Amber' },
    { key: 'sky', color: '#0284C7', name: 'Sky' },
    { key: 'rose', color: '#E11D48', name: 'Rose' },
    { key: 'indigo', color: '#4F46E5', name: 'Indigo' },
    { key: 'emerald', color: '#059669', name: 'Emerald' },
    { key: 'gray', color: '#4B5563', name: 'Gray' },
  ]

  const swatchButtons = colorSwatches.map(swatch =>
    `<button type="button" class="swatch ${initialData?.colorKey === swatch.key ? 'selected' : ''}" data-color="${swatch.key}" style="background: ${swatch.color};" title="${swatch.name}"></button>`
  ).join('')

  const title = initialData ? STRINGS.editCategory : STRINGS.newCategory
  const buttonText = initialData ? STRINGS.save : STRINGS.add

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; }
    h3 { font-size: 14px; margin-bottom: 16px; color: #1f2937; }
    label { display: block; font-size: 11px; font-weight: 500; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    input { width: 100%; padding: 10px 12px; margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
    input:focus { outline: none; border-color: #2D6BFB; }
    input::placeholder { color: #9ca3af; }
    .icon-section { margin-bottom: 12px; }
    .color-section { margin-bottom: 12px; }
    .preset-grid { 
      display: grid; 
      grid-template-columns: repeat(6, 1fr); 
      gap: 4px; 
      margin-bottom: 4px;
    }
    .preset-btn { 
      width: 100%; 
      aspect-ratio: 1; 
      padding: 0;
      font-size: 16px; 
      background: #f9fafb; 
      border: 1px solid #e5e7eb; 
      border-radius: 6px; 
      cursor: pointer; 
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .preset-btn:hover { 
      background: #f3f4f6; 
      border-color: #d1d5db;
      transform: scale(1.05);
    }
    .preset-btn.selected { 
      background: #fdf2f8; 
      border-color: #2D6BFB; 
      box-shadow: 0 0 0 2px rgba(45, 107, 251, 0.2);
    }
    .color-swatches {
      display: flex;
      gap: 4px;
      flex-wrap: nowrap;
      margin-bottom: 8px;
    }
    .swatch {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 2px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .swatch:hover {
      transform: scale(1.05);
      border-color: #d1d5db;
    }
    .swatch.selected {
      border-color: #2D6BFB;
      box-shadow: 0 0 0 2px rgba(45, 107, 251, 0.2);
    }
    .swatch.selected::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 6L9 17l-5-5' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }
    .submit-btn { width: 100%; padding: 12px; background: #2D6BFB; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 4px; }
    .submit-btn:hover { background: #1E5BD9; }
  </style>
</head>
<body>
  <h3>${title}</h3>
  <input type="hidden" id="id" value="${initialData?.id || ''}">
  
  <label>${STRINGS.categoryFormName}</label>
  <input id="name" type="text" placeholder="${STRINGS.categoryFormNamePlaceholder}" value="${initialData?.name || ''}">
  
  <div class="icon-section">
    <label>${STRINGS.categoryFormIcon}</label>
    <input id="icon" type="text" placeholder="👤" maxlength="2" value="${initialData?.icon || ''}">
    <div class="preset-grid">${presetButtons}</div>
  </div>
  
  <div class="color-section">
    <label>${STRINGS.categoryFormColor}</label>
    <div class="color-swatches">${swatchButtons}</div>
    <input type="hidden" id="color" value="${initialData?.colorKey || 'pink'}">
  </div>
  
  <button type="button" class="submit-btn" id="submit">${buttonText}</button>
  <script>
    const iconInput = document.getElementById('icon');
    const colorInput = document.getElementById('color');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const swatchBtns = document.querySelectorAll('.swatch');
    
    function updatePresetHighlight() {
      const currentValue = iconInput.value;
      presetBtns.forEach(btn => {
        if (btn.dataset.emoji === currentValue) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    }
    
    function updateSwatchHighlight() {
      const currentValue = colorInput.value;
      swatchBtns.forEach(btn => {
        if (btn.dataset.color === currentValue) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    }
    
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        iconInput.value = btn.dataset.emoji;
        updatePresetHighlight();
      });
    });
    
    swatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorInput.value = btn.dataset.color;
        updateSwatchHighlight();
      });
    });
    
    iconInput.addEventListener('input', updatePresetHighlight);
    
    updatePresetHighlight();
    updateSwatchHighlight();
    
    document.getElementById('submit').onclick = () => {
      const id = document.getElementById('id').value
      const name = document.getElementById('name').value.trim()
      const icon = iconInput.value || '👤'
      const color = colorInput.value
      
      if (name) {
        const type = id ? 'updateCategory' : 'addCategory'
        parent.postMessage({ pluginMessage: { type, id, name, icon, color } }, '*')
      }
    }
    document.getElementById('name').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('submit').click()
    })
    document.getElementById('name').focus()
    
    if ('${initialData?.id || ''}') {
        document.getElementById('name').select()
    }
  </script>
</body>
</html>`
}

export const CATEGORY_FORM_SIZE = { width: 320, height: 520 }
