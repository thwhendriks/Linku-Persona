/**
 * UI Strings for Linku Persona Widget
 * 
 * All user-facing text is centralized here for i18n support.
 * English is the default language, Dutch is available via settings.
 */

import type { Language } from './types'

// English strings (default)
const STRINGS_EN = {
  // Widget Header
  defaultTitle: 'User Profiles',
  profileCount: (n: number) => `${n} profile${n !== 1 ? 's' : ''}`,
  categoryCount: (n: number) => `${n} ${n !== 1 ? 'categories' : 'category'}`,
  
  // Empty State
  emptyTitle: 'All your audience insights in one place',
  emptySubtitle: 'Create profiles, group them in categories, and share with your team.',
  emptyAddFirst: '+ Add first profile',
  emptyTip: '💡 Tip: Customize profile fields via Widget settings. Add custom fields or hide what you don\'t need.',
  brandingPrefix: 'A tool by',
  
  // Tip Banner
  tipMessage: 'Tip: Customize profile fields via Widget settings in the menu.',
  tipHide: 'Hide tip',
  
  // Categories
  uncategorized: 'Uncategorized',
  noProfilesInCategory: 'No profiles in this category yet',
  newCategory: 'New category',
  editCategory: 'Edit category',
  categoryEdit: 'Edit',
  categoryDelete: 'Delete',
  newProfileTooltip: 'New profile',
  changeCategoryTooltip: 'Change category',
  
  // Category Form
  categoryFormName: 'Name',
  categoryFormNamePlaceholder: 'E.g. Healthcare professionals',
  categoryFormIcon: 'Icon',
  categoryFormColor: 'Color',
  
  // Profiles
  newProfile: 'New profile',
  newProfileShort: 'New',
  profileNamePlaceholder: 'Profile name...',
  deleteProfile: 'Delete profile',
  noCategory: 'No category',
  
  // Tasks
  noTasks: 'No tasks added yet',
  addTask: '+ Task',
  taskPlaceholder: 'Task...',
  newTask: 'New task',
  
  // Detail Panel
  detailPanelEmpty: 'Click a profile to\nview details',
  
  // Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  add: 'Add',
  close: 'Close',
  
  // Settings
  settingsTitle: 'Profile Fields',
  settingsSubtitle: 'Choose which fields are visible and in what order',
  addField: '+ Add new field',
  fieldNamePlaceholder: 'Field name...',
  builtInBadge: 'Default',
  showField: 'Show',
  hideField: 'Hide',
  deleteFieldConfirm: 'Delete field? All data will be lost.',
  
  // Delete Confirmation
  deleteProfileTitle: 'Delete Profile',
  deleteCategoryTitle: 'Delete Category',
  deleteProfileMessage: (name: string) => `Are you sure you want to delete "${name}"?`,
  deleteCategoryMessage: (name: string) => `Are you sure you want to delete category "${name}"?`,
  deleteCategoryWithProfiles: (name: string, count: number) => 
    `Are you sure you want to delete category "${name}"?<br><br><strong>${count} profile${count > 1 ? 's' : ''} will be moved to "Uncategorized".</strong>`,
  
  // Import/Export
  importTitle: 'Import JSON',
  importHint: 'Paste the exported JSON data here',
  importButton: 'Import',
  importPlaceholder: '{"widgetTitle": "...", "widgetSettings": {...}, "categories": [...], "profiles": {...}}',
  exportTitle: 'Export JSON',
  exportLoading: 'Loading...',
  exportCopying: 'Copying...',
  exportCopied: 'Copied!',
  exportManualHint: 'Copy the JSON data below manually:',
  
  // Category Picker
  categoryPickerTitle: 'Select category',
  categoryPickerLabel: 'Category',
  
  // Property Menu Tooltips
  menuSettings: 'Widget settings',
  menuAddProfile: 'Add profile',
  menuAddCategory: 'Add category',
  menuExport: 'Export JSON',
  menuImport: 'Import JSON',
  
  // Notifications
  categoryAdded: (name: string) => `Category "${name}" added`,
  categoryUpdated: (name: string) => `Category "${name}" updated`,
  categoryDeleted: (name: string) => `Category "${name}" deleted`,
  categoryDeletedWithProfiles: (name: string, count: number) => 
    `Category "${name}" deleted. ${count} profile${count > 1 ? 's' : ''} moved.`,
  profileDeleted: 'Profile deleted',
  categoryUpdatedNotify: 'Category updated',
  settingsSaved: 'Settings saved',
  importSuccess: 'Data imported successfully',
  importError: 'Import error: invalid JSON format',
  exportStarted: 'Export started...',
  exportCopiedNotify: 'Data copied to clipboard',
  exportError: 'Error copying to clipboard',

  // Language Settings
  languageLabel: 'Language',
  languageEnglish: 'English',
  languageDutch: 'Nederlands (Dutch)',

  // Built-in Field Labels
  fieldQuote: 'Quote',
  fieldContext: 'Context',
  fieldDescription: 'Description',
  fieldTasks: 'Tasks',
}

// Dutch strings
const STRINGS_NL: typeof STRINGS_EN = {
  // Widget Header
  defaultTitle: 'Gebruikersprofielen',
  profileCount: (n: number) => `${n} profiel${n !== 1 ? 'en' : ''}`,
  categoryCount: (n: number) => `${n} categorie${n !== 1 ? 'ën' : ''}`,
  
  // Empty State
  emptyTitle: 'Al je doelgroepinformatie in één overzicht',
  emptySubtitle: 'Maak profielen, groepeer ze in categorieën, en deel ze met je team.',
  emptyAddFirst: '+ Eerste profiel toevoegen',
  emptyTip: '💡 Tip: Pas profielvelden aan via Widget instellingen. Voeg eigen velden toe of verberg wat je niet nodig hebt.',
  brandingPrefix: 'Een tool van',
  
  // Tip Banner
  tipMessage: 'Tip: Pas profielvelden aan via Widget instellingen in het menu.',
  tipHide: 'Tip verbergen',
  
  // Categories
  uncategorized: 'Ongecategoriseerd',
  noProfilesInCategory: 'Nog geen profielen in deze categorie',
  newCategory: 'Nieuwe categorie',
  editCategory: 'Categorie bewerken',
  categoryEdit: 'Bewerken',
  categoryDelete: 'Verwijderen',
  newProfileTooltip: 'Nieuw profiel',
  changeCategoryTooltip: 'Categorie wijzigen',
  
  // Category Form
  categoryFormName: 'Naam',
  categoryFormNamePlaceholder: 'Bijv. Zorgprofessionals',
  categoryFormIcon: 'Icon',
  categoryFormColor: 'Kleur',
  
  // Profiles
  newProfile: 'Nieuw profiel',
  newProfileShort: 'Nieuw',
  profileNamePlaceholder: 'Profielnaam...',
  deleteProfile: 'Profiel verwijderen',
  noCategory: 'Geen categorie',
  
  // Tasks
  noTasks: 'Nog geen taken toegevoegd',
  addTask: '+ Taak',
  taskPlaceholder: 'Taak...',
  newTask: 'Nieuwe taak',
  
  // Detail Panel
  detailPanelEmpty: 'Klik op een profiel om\ndetails te bekijken',
  
  // Actions
  save: 'Opslaan',
  cancel: 'Annuleren',
  delete: 'Verwijderen',
  add: 'Toevoegen',
  close: 'Sluiten',
  
  // Settings
  settingsTitle: 'Profielvelden',
  settingsSubtitle: 'Bepaal welke velden zichtbaar zijn en in welke volgorde',
  addField: '+ Nieuw veld toevoegen',
  fieldNamePlaceholder: 'Veldnaam...',
  builtInBadge: 'Standaard',
  showField: 'Tonen',
  hideField: 'Verbergen',
  deleteFieldConfirm: 'Veld verwijderen? Alle data gaat verloren.',
  
  // Delete Confirmation
  deleteProfileTitle: 'Profiel verwijderen',
  deleteCategoryTitle: 'Categorie verwijderen',
  deleteProfileMessage: (name: string) => `Weet je zeker dat je "${name}" wilt verwijderen?`,
  deleteCategoryMessage: (name: string) => `Weet je zeker dat je categorie "${name}" wilt verwijderen?`,
  deleteCategoryWithProfiles: (name: string, count: number) => 
    `Weet je zeker dat je categorie "${name}" wilt verwijderen?<br><br><strong>${count} profiel${count > 1 ? 'en' : ''} ${count > 1 ? 'worden' : 'wordt'} automatisch verplaatst naar "Ongecategoriseerd".</strong>`,
  
  // Import/Export
  importTitle: 'Importeer JSON',
  importHint: 'Plak hier de geëxporteerde JSON data',
  importButton: 'Importeren',
  importPlaceholder: '{"widgetTitle": "...", "widgetSettings": {...}, "categories": [...], "profiles": {...}}',
  exportTitle: 'Exporteer JSON',
  exportLoading: 'Laden...',
  exportCopying: 'Bezig met kopiëren...',
  exportCopied: 'Gekopieerd!',
  exportManualHint: 'Kopieer de JSON data hieronder handmatig:',
  
  // Category Picker
  categoryPickerTitle: 'Selecteer categorie',
  categoryPickerLabel: 'Categorie',
  
  // Property Menu Tooltips
  menuSettings: 'Widget instellingen',
  menuAddProfile: 'Profiel toevoegen',
  menuAddCategory: 'Categorie toevoegen',
  menuExport: 'Exporteer JSON',
  menuImport: 'Importeer JSON',
  
  // Notifications
  categoryAdded: (name: string) => `Categorie "${name}" toegevoegd`,
  categoryUpdated: (name: string) => `Categorie "${name}" bijgewerkt`,
  categoryDeleted: (name: string) => `Categorie "${name}" verwijderd`,
  categoryDeletedWithProfiles: (name: string, count: number) => 
    `Categorie "${name}" verwijderd. ${count} profiel${count > 1 ? 'en' : ''} verplaatst.`,
  profileDeleted: 'Profiel verwijderd',
  categoryUpdatedNotify: 'Categorie bijgewerkt',
  settingsSaved: 'Instellingen opgeslagen',
  importSuccess: 'Data succesvol geïmporteerd',
  importError: 'Fout bij importeren: ongeldig JSON formaat',
  exportStarted: 'Export gestart...',
  exportCopiedNotify: 'Data gekopieerd naar klembord',
  exportError: 'Fout bij kopiëren naar klembord',

  // Language Settings
  languageLabel: 'Taal',
  languageEnglish: 'English',
  languageDutch: 'Nederlands (Dutch)',

  // Built-in Field Labels
  fieldQuote: 'Quote',
  fieldContext: 'Context',
  fieldDescription: 'Beschrijving',
  fieldTasks: 'Taken',
}

// Type for strings object
export type StringsType = typeof STRINGS_EN

// Get strings for a specific language
export function getStrings(language: Language): StringsType {
  return language === 'nl' ? STRINGS_NL : STRINGS_EN
}

// Get the translated label for a field
// Built-in fields use translated labels, custom fields use their stored label
export function getFieldLabel(
  field: { isBuiltIn: boolean; builtInKey?: string; label: string },
  strings: StringsType
): string {
  if (field.isBuiltIn && field.builtInKey) {
    switch (field.builtInKey) {
      case 'quote': return strings.fieldQuote
      case 'context': return strings.fieldContext
      case 'description': return strings.fieldDescription
      case 'tasks': return strings.fieldTasks
    }
  }
  return field.label
}

// Legacy export for backwards compatibility during migration
// Components should use getStrings(language) instead
export const STRINGS = STRINGS_EN
