# Linku Persona Widget

## Project Overview
A **FigJam widget** for managing and visualizing user profiles (personas). Built with TypeScript using the Figma Widget API. Supports expand/collapse views, inline editing, categorization, and JSON import/export.

## Tech Stack
- **Language**: TypeScript
- **Platform**: Figma/FigJam Widget
- **Build Tool**: esbuild
- **Type Definitions**: `@figma/widget-typings`, `@figma/plugin-typings`

## Project Structure
```
widget-src/
├── code.tsx          # Main widget source (all logic and components)
├── tsconfig.json     # TypeScript configuration
dist/
├── code.js           # Compiled output (loaded by Figma)
manifest.json         # Figma widget manifest
```

## Key Commands
```bash
npm install           # Install dependencies
npm run build         # Build once
npm run watch         # Build and watch for changes
npm run lint          # Run ESLint
npm run tsc           # Type check
```

## Data Model

### Category
```typescript
interface Category {
  id: string
  name: string
  icon: string          // Emoji
  colorKey: ColorKey    // 'pink' | 'teal' | 'purple' | 'amber' | 'sky' | 'rose' | 'indigo' | 'emerald'
  order: number
}
```

### Profile
```typescript
interface Profile {
  id: string
  name: string
  shortName: string
  categoryId: string
  level: 'Basis' | 'Gevorderd' | 'Expert'
  orgSize: 'S' | 'M' | 'L' | 'XL' | 'Alle' | 'Extern'
  description: string
  quote: string
  tasks: string[]
  context: string
}
```

## Widget Features
- **Categories**: Add, edit, delete categories with custom icons and colors
- **Profiles**: Create profiles within categories, inline editing of all fields
- **Detail Panel**: Right-side panel showing expanded profile details
- **Import/Export**: JSON import and clipboard export functionality

## Figma Widget Development Notes

### State Management
- Uses `useSyncedState` for simple state (expanded ID, categories, title)
- Uses `useSyncedMap` for profiles (concurrent editing support)

### UI Actions (Property Menu)
Actions that open a UI window **must return a `Promise<void>`** to keep the widget active:
```typescript
case 'exportJson':
  return exportData()  // Returns Promise<void>
```

### Message Passing
Communication between widget and UI iframe:
1. Widget opens UI with `figma.showUI(html, options)`
2. UI sends messages via `window.parent.postMessage({ pluginMessage: {...} }, '*')`
3. Widget receives in `useEffect` via `figma.ui.onmessage`
4. Widget sends to UI via `figma.ui.postMessage({ type: '...', data: '...' })`

### Clipboard Access
Clipboard operations require a **visible** UI window. Pattern:
1. Open visible UI
2. UI sends `uiReady` message
3. Widget sends data via `figma.ui.postMessage`
4. UI attempts copy with `document.execCommand('copy')` or `navigator.clipboard`
5. UI sends `exportComplete` on success

### Iterating SyncedMap
Always use `Array.from()` when iterating a SyncedMap:
```typescript
Array.from(profilesMap.entries()).forEach(([key, profile]) => { ... })
```

## Language
The widget UI is in **Dutch (Nederlands)**.
