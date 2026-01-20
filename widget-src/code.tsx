/**
 * Linku Persona Widget
 * 
 * Een FigJam widget voor het beheren en visualiseren van gebruikersprofielen.
 * Ondersteunt expand/collapse, inline editing, en categorisatie.
 * 
 * @author Tim Hendriks, Linku
 * @version 2.0.0
 */

// Types
import type { Profile, Category, ColorKey, WidgetSettings, TasksModuleConfig, Language } from './types'

// Constants
import { COLORS, DEFAULT_CATEGORIES, DEFAULT_FIELD_CONFIG } from './constants'

// Icons
import { CloseIcon } from './icons'

// Strings
import { getStrings } from './strings'

// Utils
import { generateId, getNextProfileNumber } from './utils'

// Components
import { CategorySection, DetailPanel, EmptyState } from './components'

// UI Templates
import {
  getCategoryFormHTML, CATEGORY_FORM_SIZE,
  getDeleteConfirmHTML, DELETE_CONFIRM_SIZE,
  getImportDataHTML, IMPORT_DATA_SIZE,
  getCategoryPickerHTML, CATEGORY_PICKER_SIZE,
  getSettingsHTML, SETTINGS_SIZE,
  getExportDataHTML, EXPORT_DATA_SIZE,
} from './ui'

// Figma Widget API
const { widget } = figma
const {
  AutoLayout,
  Text,
  Input,
  SVG,
  useSyncedState,
  useSyncedMap,
  usePropertyMenu,
  useEffect,
  useWidgetNodeId,
  register,
} = widget

// ============================================================================
// MAIN WIDGET
// ============================================================================

function UserProfilesWidget() {
  const _widgetId = useWidgetNodeId()

  // State: which profile is expanded (null = none)
  const [expandedId, setExpandedId] = useSyncedState<string | null>('expandedId', null)

  // State: all profiles using SyncedMap for concurrent editing support
  const profilesMap = useSyncedMap<Profile>('profiles')

  // State: language (default English for Community)
  const [language, setLanguage] = useSyncedState<Language>('language', 'en')

  // Get localized strings
  const STRINGS = getStrings(language)

  // State: categories
  const [categories, setCategories] = useSyncedState<Category[]>('categories', DEFAULT_CATEGORIES)

  // State: widget title
  const [widgetTitle, setWidgetTitle] = useSyncedState('widgetTitle', STRINGS.defaultTitle)

  // State: widget settings (field configuration)
  const [widgetSettings, setWidgetSettings] = useSyncedState<WidgetSettings>('widgetSettings', {
    fields: DEFAULT_FIELD_CONFIG
  })

  // State: tip visibility
  const [showTip, setShowTip] = useSyncedState('showTip', true)

  // Migration: ensure tasks field exists (for widgets created before tasks was added to fields)
  const migratedSettings = (() => {
    const hasTasksField = widgetSettings.fields.some(f => f.builtInKey === 'tasks')
    if (!hasTasksField) {
      const legacySettings = widgetSettings as WidgetSettings & { tasksModule?: TasksModuleConfig }
      const tasksLabel = legacySettings.tasksModule?.label || 'Taken'
      const tasksVisible = legacySettings.tasksModule?.isVisible ?? true
      const maxOrder = Math.max(...widgetSettings.fields.map(f => f.order), -1)
      
      return {
        fields: [
          ...widgetSettings.fields,
          { id: 'tasks', label: tasksLabel, isBuiltIn: true, builtInKey: 'tasks' as const, isVisible: tasksVisible, order: maxOrder + 1 }
        ]
      }
    }
    return widgetSettings
  })()

  // Property menu
  usePropertyMenu(
    [
      {
        itemType: 'action',
        propertyName: 'openSettings',
        tooltip: STRINGS.menuSettings,
      },
      {
        itemType: 'separator',
      },
      {
        itemType: 'action',
        propertyName: 'addProfile',
        tooltip: STRINGS.menuAddProfile,
      },
      {
        itemType: 'action',
        propertyName: 'addCategory',
        tooltip: STRINGS.menuAddCategory,
      },
      {
        itemType: 'separator',
      },
      {
        itemType: 'action',
        propertyName: 'exportJson',
        tooltip: STRINGS.menuExport,
      },
      {
        itemType: 'action',
        propertyName: 'importJson',
        tooltip: STRINGS.menuImport,
      },
    ],
    ({ propertyName }) => {
      switch (propertyName) {
        case 'openSettings':
          return showSettingsUI()
        case 'addProfile':
          addProfile('')
          break
        case 'addCategory':
          return showCategoryFormUI()
        case 'exportJson':
          return exportData()
        case 'importJson':
          return showImportUI()
      }
    }
  )

  // Handle UI messages
  useEffect(() => {
    figma.ui.onmessage = (msg: { type: string; id?: string; name?: string; icon?: string; color?: string; data?: string; profileId?: string; categoryId?: string; deleteType?: string; settings?: WidgetSettings; language?: string }) => {
      if (msg.type === 'addCategory' && msg.name) {
        const newCategory: Category = {
          id: `cat-${generateId()}`,
          name: msg.name,
          icon: msg.icon || '👤',
          colorKey: (msg.color as ColorKey) || 'pink',
          order: categories.length,
        }
        setCategories([...categories, newCategory])
        figma.closePlugin()
        figma.notify(STRINGS.categoryAdded(msg.name))
      }

      if (msg.type === 'updateCategory' && msg.id && msg.name) {
        const updatedCategories = categories.map(cat =>
          cat.id === msg.id
            ? { ...cat, name: msg.name!, icon: msg.icon || '👤', colorKey: (msg.color as ColorKey) || 'pink' }
            : cat
        )
        setCategories(updatedCategories)
        figma.closePlugin()
        figma.notify(STRINGS.categoryUpdated(msg.name))
      }

      if (msg.type === 'importData' && msg.data) {
        try {
          const data = JSON.parse(msg.data)
          
          if (data.widgetTitle) {
            setWidgetTitle(data.widgetTitle)
          }
          
          if (data.widgetSettings) {
            setWidgetSettings(data.widgetSettings)
          }
          
          if (data.categories) {
            setCategories(data.categories)
          }
          
          if (data.profiles) {
            profilesMap.keys().forEach(key => profilesMap.delete(key))
            Object.entries(data.profiles).forEach(([key, profile]) => {
              const { level: _level, orgSize: _orgSize, ...cleanProfile } = profile as Profile & { level?: string; orgSize?: string }
              profilesMap.set(key, cleanProfile as Profile)
            })
          }
          
          figma.closePlugin()
          figma.notify(STRINGS.importSuccess)
        } catch (e) {
          figma.notify(STRINGS.importError, { error: true })
        }
      }

      if (msg.type === 'uiReady') {
        exportData(true)
      }

      if (msg.type === 'exportComplete') {
        figma.closePlugin()
        figma.notify(STRINGS.exportCopiedNotify)
      }

      if (msg.type === 'exportError') {
        figma.closePlugin()
        figma.notify(STRINGS.exportError, { error: true })
      }

      if (msg.type === 'updateProfileCategory' && msg.profileId) {
        const profile = profilesMap.get(msg.profileId)
        if (profile) {
          updateProfile({ ...profile, categoryId: msg.categoryId || '' })
          figma.closePlugin()
          figma.notify(STRINGS.categoryUpdatedNotify)
        }
      }

      if (msg.type === 'confirmDelete' && msg.deleteType && msg.id) {
        if (msg.deleteType === 'profile') {
          deleteProfile(msg.id)
          figma.notify(STRINGS.profileDeleted)
        } else if (msg.deleteType === 'category') {
          const cat = categories.find(c => c.id === msg.id)
          if (cat) {
            actualDeleteCategory(cat)
          }
        }
        figma.closePlugin()
      }

      if (msg.type === 'cancelDelete') {
        figma.closePlugin()
      }

      if (msg.type === 'updateSettings') {
        if (msg.settings) {
          setWidgetSettings(msg.settings)
        }
        if (msg.language) {
          setLanguage(msg.language as Language)
        }
        figma.closePlugin()
        figma.notify(STRINGS.settingsSaved)
      }

      if (msg.type === 'cancelSettings') {
        figma.closePlugin()
      }
    }
  })

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  function showCategoryFormUI(initialData?: Category) {
    return new Promise<void>(() => {
      figma.showUI(getCategoryFormHTML({ initialData, language }), CATEGORY_FORM_SIZE)
    })
  }

  function showDeleteConfirmationUI(
    type: 'profile' | 'category',
    id: string,
    name: string,
    profileCount?: number
  ) {
    const title = type === 'profile' ? STRINGS.deleteProfileTitle : STRINGS.deleteCategoryTitle
    return new Promise<void>(() => {
      figma.showUI(
        getDeleteConfirmHTML({ type, id, name, profileCount, language }),
        { ...DELETE_CONFIRM_SIZE, title }
      )
    })
  }

  function showImportUI() {
    return new Promise<void>(() => {
      figma.showUI(getImportDataHTML({ language }), IMPORT_DATA_SIZE)
    })
  }

  function showCategoryPickerUI(profileId: string, currentCategoryId: string) {
    return new Promise<void>(() => {
      figma.showUI(
        getCategoryPickerHTML({ profileId, currentCategoryId, categories, language }),
        CATEGORY_PICKER_SIZE
      )
    })
  }

  function showSettingsUI() {
    return new Promise<void>(() => {
      figma.showUI(
        getSettingsHTML({ settings: migratedSettings, language }),
        { ...SETTINGS_SIZE, title: STRINGS.settingsTitle }
      )
    })
  }

  function exportData(sendPayload = false) {
    if (sendPayload) {
      const profiles: Record<string, Profile> = {}
      Array.from(profilesMap.entries()).forEach(([key, profile]) => {
        const { description, quote, tasks, context, customFields, id, name, categoryId } = profile
        profiles[key] = {
          id,
          name,
          categoryId,
          description,
          quote,
          tasks,
          context,
          ...(customFields && Object.keys(customFields).length > 0 ? { customFields } : {})
        }
      })

      const data = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        widgetTitle,
        widgetSettings: migratedSettings,
        categories,
        profiles,
      }

      const json = JSON.stringify(data, null, 2)
      figma.ui.postMessage({ type: 'exportPayload', data: json })
      return
    }

    return new Promise<void>(() => {
      figma.notify(STRINGS.exportStarted)
      figma.showUI(getExportDataHTML({ language }), { ...EXPORT_DATA_SIZE, title: STRINGS.exportTitle })
    })
  }

  // ============================================================================
  // PROFILE & CATEGORY HELPERS
  // ============================================================================

  function addProfile(categoryId: string) {
    const newId = `profile-${getNextProfileNumber(profilesMap)}`
    const newProfile: Profile = {
      id: newId,
      name: STRINGS.newProfile,
      categoryId,
      description: '',
      quote: '',
      tasks: [],
      context: '',
    }
    profilesMap.set(newId, newProfile)
    setExpandedId(newId)
  }

  function updateProfile(profile: Profile) {
    profilesMap.set(profile.id, profile)
  }

  function deleteProfile(id: string) {
    profilesMap.delete(id)
    if (expandedId === id) {
      setExpandedId(null)
    }
  }

  function getProfilesForCategory(categoryId: string): Profile[] {
    return profilesMap
      .entries()
      .filter(([_, profile]) => profile.categoryId === categoryId)
      .map(([_, profile]) => profile)
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  function editCategory(category: Category) {
    return showCategoryFormUI(category)
  }

  function deleteCategory(category: Category) {
    const profiles = getProfilesForCategory(category.id)
    return showDeleteConfirmationUI('category', category.id, category.name, profiles.length)
  }

  function actualDeleteCategory(category: Category) {
    const profiles = getProfilesForCategory(category.id)
    profiles.forEach(profile => {
      profilesMap.set(profile.id, { ...profile, categoryId: '' })
    })
    
    const newCategories = categories.filter(c => c.id !== category.id)
    setCategories(newCategories)
    
    const message = profiles.length > 0
      ? STRINGS.categoryDeletedWithProfiles(category.name, profiles.length)
      : STRINGS.categoryDeleted(category.name)
    figma.notify(message)
  }

  function moveCategoryUp(categoryId: string) {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId)
    
    if (currentIndex > 0) {
      const currentCategory = sortedCategories[currentIndex]
      const previousCategory = sortedCategories[currentIndex - 1]
      
      // Swap order values
      const tempOrder = currentCategory.order
      currentCategory.order = previousCategory.order
      previousCategory.order = tempOrder
      
      setCategories([...categories])
    }
  }

  function moveCategoryDown(categoryId: string) {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId)
    
    if (currentIndex < sortedCategories.length - 1) {
      const currentCategory = sortedCategories[currentIndex]
      const nextCategory = sortedCategories[currentIndex + 1]
      
      // Swap order values
      const tempOrder = currentCategory.order
      currentCategory.order = nextCategory.order
      nextCategory.order = tempOrder
      
      setCategories([...categories])
    }
  }

  // Auto-select first profile on initial load ONLY if none is selected
  useEffect(() => {
    if (!expandedId && profilesMap.size > 0) {
      // NOTE: We removed the auto-re-select logic here to allow the user 
      // to explicitly close the detail panel.
    }
  })

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalProfiles = profilesMap.size

  const expandedProfile: Profile | null = expandedId ? (profilesMap.get(expandedId) ?? null) : null
  const expandedCategory: Category | null = expandedProfile
    ? (categories.find(cat => cat.id === expandedProfile.categoryId) ?? null)
    : null
  const expandedProfileNumber = expandedProfile
    ? Array.from(profilesMap.values())
      .sort((a, b) => a.id.localeCompare(b.id))
      .findIndex(p => p.id === expandedProfile.id) + 1
    : 0

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={20}
      cornerRadius={16}
      fill="#FFFFFF"
      stroke="#E5E7EB"
      strokeWidth={1}
      width={960}
    >
      {/* Widget header */}
      <AutoLayout
        direction="horizontal"
        spacing={12}
        width="fill-parent"
        verticalAlignItems="center"
      >
        <AutoLayout direction="vertical" spacing={2} width="fill-parent">
          <Input
            value={widgetTitle}
            onTextEditEnd={(e) => setWidgetTitle(e.characters)}
            fontSize={20}
            fontWeight={700}
            fill="#1F2937"
            fontFamily="Inter"
            width="fill-parent"
          />
          <Text fontSize={12} fill="#6B7280" fontFamily="Inter">
            {STRINGS.profileCount(totalProfiles)} · {STRINGS.categoryCount(categories.length)}
          </Text>
        </AutoLayout>

        {/* Color legend - only render if there are items to show */}
        {(categories.length > 0 || getProfilesForCategory('').length > 0) && (
          <AutoLayout direction="horizontal" spacing={4}>
            {categories.map((cat) => (
              <AutoLayout
                key={cat.id}
                width={24}
                height={24}
                cornerRadius={6}
                fill={COLORS[cat.colorKey]?.accent || COLORS.pink.accent}
                horizontalAlignItems="center"
                verticalAlignItems="center"
              >
                <Text fontSize={12} fontFamily="Inter" fill="#FFFFFF">
                  {getProfilesForCategory(cat.id).length}
                </Text>
              </AutoLayout>
            ))}
            {/* Show uncategorized count if there are any */}
            {getProfilesForCategory('').length > 0 && (
              <AutoLayout
                key="uncategorized"
                width={24}
                height={24}
                cornerRadius={6}
                fill={COLORS.gray.accent}
                horizontalAlignItems="center"
                verticalAlignItems="center"
              >
                <Text fontSize={12} fontFamily="Inter" fill="#FFFFFF">
                  {getProfilesForCategory('').length}
                </Text>
              </AutoLayout>
            )}
          </AutoLayout>
        )}
      </AutoLayout>

      {/* Dismissable tip - shown under header when there are profiles */}
      {(categories.length > 0 || profilesMap.size > 0) && showTip && (
        <AutoLayout
          fill="#F0F9FF"
          stroke="#BAE6FD"
          strokeWidth={1}
          cornerRadius={8}
          padding={{ vertical: 10, horizontal: 12 }}
          width="fill-parent"
          spacing={8}
          verticalAlignItems="center"
        >
          <Text fontSize={12} fontFamily="Inter">💡</Text>
          <Text 
            fontSize={12} 
            fill="#0369A1" 
            fontFamily="Inter"
            width="fill-parent"
          >
            {STRINGS.tipMessage}
          </Text>
          <AutoLayout
            width={20}
            height={20}
            cornerRadius={4}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            onClick={() => setShowTip(false)}
            hoverStyle={{ fill: '#E0F2FE' }}
          >
            <SVG src={CloseIcon} />
          </AutoLayout>
        </AutoLayout>
      )}

      {/* Empty state */}
      {categories.length === 0 && profilesMap.size === 0 && (
        <EmptyState onAddProfile={() => addProfile('')} strings={STRINGS} />
      )}

      {/* Main content area: horizontal layout (only when not empty) */}
      {(categories.length > 0 || profilesMap.size > 0) && (
        <AutoLayout
          direction="horizontal"
          spacing={16}
          width="fill-parent"
        >
          {/* Left panel: Categories with profiles */}
          <AutoLayout
            direction="vertical"
            spacing={12}
            width="fill-parent"
          >
            {categories
              .sort((a, b) => a.order - b.order)
              .map((category, index, sortedArray) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  profiles={getProfilesForCategory(category.id)}
                  allProfiles={profilesMap}
                  expandedId={expandedId}
                  onExpand={setExpandedId}
                  onUpdateProfile={updateProfile}
                  onDeleteProfile={deleteProfile}
                  onAddProfile={() => addProfile(category.id)}
                  onEditCategory={() => editCategory(category)}
                  onDeleteCategory={() => deleteCategory(category)}
                  onMoveUp={() => moveCategoryUp(category.id)}
                  onMoveDown={() => moveCategoryDown(category.id)}
                  isFirst={index === 0}
                  isLast={index === sortedArray.length - 1}
                  strings={STRINGS}
                />
              ))}

            {/* Uncategorized section */}
            {getProfilesForCategory('').length > 0 && (
              <CategorySection
                key="uncategorized"
                category={{
                  id: '',
                  name: STRINGS.uncategorized,
                  icon: '📂',
                  colorKey: 'gray',
                  order: 999,
                }}
                profiles={getProfilesForCategory('')}
                allProfiles={profilesMap}
                expandedId={expandedId}
                onExpand={setExpandedId}
                onUpdateProfile={updateProfile}
                onDeleteProfile={deleteProfile}
                onAddProfile={() => addProfile('')}
                onEditCategory={() => {}}
                onDeleteCategory={() => {}}
                strings={STRINGS}
              />
            )}

            {/* Add Category Button */}
            <AutoLayout
              width="fill-parent"
              height={48}
              cornerRadius={12}
              stroke="#D1D5DB"
              strokeWidth={1}
              strokeDashPattern={[4, 4]}
              horizontalAlignItems="center"
              verticalAlignItems="center"
              onClick={() => showCategoryFormUI()}
              hoverStyle={{ fill: '#F9FAFB' }}
            >
              <Text
                fontSize={14}
                fontWeight={500}
                fill="#6B7280"
                fontFamily="Inter"
              >
                {STRINGS.addCategory}
              </Text>
            </AutoLayout>
          </AutoLayout>

          {/* Right panel: Detail view */}
          <DetailPanel
            expandedProfile={expandedProfile}
            profileNumber={expandedProfileNumber}
            category={expandedCategory}
            onCollapse={() => setExpandedId(null)}
            onUpdate={updateProfile}
            onDelete={() => {
              if (expandedProfile) {
                return showDeleteConfirmationUI('profile', expandedProfile.id, expandedProfile.name)
              }
            }}
            onEditCategory={() => expandedProfile && showCategoryPickerUI(expandedProfile.id, expandedProfile.categoryId)}
            widgetSettings={migratedSettings}
            strings={STRINGS}
          />
        </AutoLayout>
      )}

    </AutoLayout>
  )
}

// Register the widget
register(UserProfilesWidget)
