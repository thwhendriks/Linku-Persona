/**
 * UI Strings for Linku Persona Widget
 * 
 * All user-facing text is centralized here for easy i18n integration.
 * To add multi-language support, replace this with a function that
 * returns the appropriate strings based on locale.
 */

export const STRINGS = {
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
}
