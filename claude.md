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
| `types.ts` | `Profile`, `Category`, `ColorKey`, `Language`, `WidgetSettings`, `FieldConfig` |
| `strings.ts` | All UI text with i18n support (EN/NL) |
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

type Language = 'en' | 'nl'
```

## i18n / Translations

The widget supports **English (default)** and **Dutch**. Language can be changed via Widget Settings.

```typescript
// types.ts
type Language = 'en' | 'nl'

// strings.ts
const STRINGS_EN = { defaultTitle: 'User Profiles', ... }
const STRINGS_NL = { defaultTitle: 'Gebruikersprofielen', ... }

export type StringsType = typeof STRINGS_EN
export function getStrings(language: Language): StringsType

// code.tsx - language stored as synced state
const [language, setLanguage] = useSyncedState<Language>('language', 'en')
const STRINGS = getStrings(language)
```

### Component Pattern
Components receive `strings: StringsType` as a prop:
```typescript
// components/EmptyState.tsx
export function EmptyState({ onAddProfile, strings }: EmptyStateProps) {
  return <Text>{strings.emptyTitle}</Text>
}
```

To add a new language: add `STRINGS_XX` object, update `Language` type, update `getStrings()`.

## Figma Widget Patterns

### Component File Structure
Components import widget primitives and receive `strings` prop for i18n:
```typescript
// components/CategorySection.tsx
import type { Profile, Category } from '../types'
import type { StringsType } from '../strings'
const { AutoLayout, Text } = figma.widget

export function CategorySection({ category, profiles, strings }: CategorySectionProps) { ... }
```

### UI Template Pattern
UI templates accept `language` parameter and call `getStrings()`:
```typescript
// ui/categoryForm.ts
import { getStrings } from '../strings'

export function getCategoryFormHTML(options: { language: Language, ... }): string {
  const STRINGS = getStrings(options.language)
  return `<!DOCTYPE html>...<h3>${STRINGS.newCategory}</h3>...`
}
export const CATEGORY_FORM_SIZE = { width: 320, height: 520 }
```

### State Management
- `useSyncedState`: language, categories, title, settings, expandedId, showTip
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

Widget supports **English** (default) and **Dutch (Nederlands)**. Users can switch via Widget Settings. All text in `strings.ts` with `STRINGS_EN` and `STRINGS_NL` objects.

## Tech Stack

- TypeScript + Figma Widget API
- esbuild (bundler)
- `@figma/widget-typings`, `@figma/plugin-typings`
