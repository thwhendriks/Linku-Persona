# Linku Persona Widget

## Quick Reference

```bash
npm run build    # Build once → dist/code.js
npm run watch    # Build and watch
npm run tsc      # Type check
npm run lint     # ESLint
```

## Project Structure

```
widget-src/
├── code.tsx           # Entry point: state, handlers, main render
├── types.ts           # All TypeScript interfaces
├── constants.ts       # COLORS, DEFAULT_CATEGORIES, DEFAULT_FIELD_CONFIG
├── icons.ts           # SVG icon strings (getPlusIcon, CloseIcon, etc.)
├── strings.ts         # All UI text (i18n-ready)
├── utils.ts           # Pure helpers (generateId, getFieldValue, etc.)
├── components/
│   ├── index.ts       # Barrel export
│   ├── MiniCard.tsx   # Collapsed profile card
│   ├── DynamicField.tsx
│   ├── ExpandedCard.tsx
│   ├── StatBox.tsx
│   ├── CategorySection.tsx
│   ├── DetailPanel.tsx
│   └── EmptyState.tsx
└── ui/                # HTML templates for figma.showUI()
    ├── index.ts
    ├── categoryForm.ts
    ├── deleteConfirm.ts
    ├── importData.ts
    ├── categoryPicker.ts
    ├── settings.ts
    └── exportData.ts
```

## Key Files

| File | Purpose |
|------|---------|
| `types.ts` | `Profile`, `Category`, `ColorKey`, `WidgetSettings`, `FieldConfig` |
| `strings.ts` | All user-facing text - edit here for translations |
| `constants.ts` | Color palette, default field config |
| `code.tsx` | Widget registration, state management, UI message handlers |

## Data Model

```typescript
// types.ts
interface Profile {
  id: string
  name: string
  shortName: string
  categoryId: string        // '' = uncategorized
  description: string
  quote: string
  tasks: string[]
  context: string
  customFields?: Record<string, string>
}

interface Category {
  id: string
  name: string
  icon: string              // Emoji
  colorKey: ColorKey        // 'pink' | 'teal' | 'purple' | ... | 'gray'
  order: number
}

interface FieldConfig {
  id: string
  label: string
  isBuiltIn: boolean
  builtInKey?: 'quote' | 'context' | 'description' | 'tasks'
  isVisible: boolean
  order: number
}
```

## i18n / Translations

All UI strings are centralized in `strings.ts`:

```typescript
// strings.ts
export const STRINGS = {
  defaultTitle: 'Gebruikersprofielen',
  emptyTitle: 'Al je doelgroepinformatie in één overzicht',
  categoryAdded: (name: string) => `Categorie "${name}" toegevoegd`,
  // ... 80+ strings
}
```

To add a new language: create `STRINGS_EN`, then switch based on locale.

## Figma Widget Patterns

### Component File Structure
Each component imports widget primitives directly:
```typescript
// components/MiniCard.tsx
import type { Profile, ColorScheme } from '../types'
const { AutoLayout, Text } = figma.widget

export function MiniCard({ profile, colors, onExpand }: MiniCardProps) { ... }
```

### UI Template Pattern
UI templates return HTML strings with embedded STRINGS:
```typescript
// ui/categoryForm.ts
import { STRINGS } from '../strings'

export function getCategoryFormHTML(options: CategoryFormOptions): string {
  return `<!DOCTYPE html>...<h3>${STRINGS.newCategory}</h3>...`
}
export const CATEGORY_FORM_SIZE = { width: 320, height: 520 }
```

### State Management
- `useSyncedState`: categories, title, settings, expandedId
- `useSyncedMap`: profiles (concurrent editing support)

### Property Menu Actions
Actions that open UI **must return Promise<void>**:
```typescript
case 'exportJson':
  return exportData()  // Returns Promise<void>
```

### Message Passing
1. Widget: `figma.showUI(html, options)`
2. UI → Widget: `parent.postMessage({ pluginMessage: { type, ... } }, '*')`
3. Widget: receives in `useEffect` via `figma.ui.onmessage`
4. Widget → UI: `figma.ui.postMessage({ type, data })`

### SyncedMap Iteration
Always wrap in `Array.from()`:
```typescript
Array.from(profilesMap.entries()).forEach(([key, profile]) => { ... })
```

## Color Palette

9 color schemes defined in `constants.ts`:
- **Category colors**: pink, teal, purple, amber, sky, rose, indigo, emerald
- **Uncategorized**: gray

Each has: `bg`, `bgLight`, `accent`, `text`, `border`

## Language

Widget UI is in **Dutch (Nederlands)**. All text in `strings.ts`.

## Tech Stack

- TypeScript + Figma Widget API
- esbuild (bundler)
- `@figma/widget-typings`, `@figma/plugin-typings`
