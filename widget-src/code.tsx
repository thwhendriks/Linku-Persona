/**
 * Linku Persona Widget
 * 
 * Een FigJam widget voor het beheren en visualiseren van gebruikersprofielen.
 * Ondersteunt expand/collapse, inline editing, en categorisatie.
 * 
 * @author Tim Hendriks, Linku
 * @version 1.0.0
 */

const { widget } = figma
const {
  AutoLayout,
  Text,
  Input,
  Rectangle,
  SVG,
  useSyncedState,
  useSyncedMap,
  usePropertyMenu,
  useEffect,
  useWidgetNodeId,
  register,
} = widget

// ============================================================================
// TYPES
// ============================================================================

interface Profile {
  id: string
  name: string
  shortName: string
  categoryId: string  // Empty string = uncategorized
  description: string
  quote: string
  tasks: string[]
  context: string
  customFields?: Record<string, string>  // fieldId -> value
}

interface Category {
  id: string
  name: string
  icon: string
  colorKey: ColorKey
  order: number
}

type ColorKey = 'pink' | 'teal' | 'purple' | 'amber' | 'sky' | 'rose' | 'indigo' | 'emerald' | 'gray'

interface ColorScheme {
  bg: string
  bgLight: string
  accent: string
  text: string
  border: string
}

// Field configuration (stored globally)
interface FieldConfig {
  id: string
  label: string
  isBuiltIn: boolean        // true for quote, context, description, tasks
  builtInKey?: 'quote' | 'context' | 'description' | 'tasks'
  isVisible: boolean
  order: number
}

// Global widget settings (simplified)
interface WidgetSettings {
  fields: FieldConfig[]
}

// Legacy support for tasksModule (backwards compatibility)
interface TasksModuleConfig {
  isVisible: boolean
  label: string
}

// ============================================================================
// CONSTANTS & DESIGN TOKENS
// ============================================================================

const COLORS: Record<ColorKey, ColorScheme> = {
  pink: {
    bg: '#FDF2F8',
    bgLight: '#FDF2F8',
    accent: '#DB2777',
    text: '#9D174D',
    border: '#F9A8D4',
  },
  teal: {
    bg: '#F0FDFA',
    bgLight: '#F0FDFA',
    accent: '#0D9488',
    text: '#115E59',
    border: '#5EEAD4',
  },
  purple: {
    bg: '#FAF5FF',
    bgLight: '#FAF5FF',
    accent: '#7C3AED',
    text: '#6B21A8',
    border: '#D8B4FE',
  },
  amber: {
    bg: '#FFFBEB',
    bgLight: '#FFFBEB',
    accent: '#B45309',
    text: '#92400E',
    border: '#FCD34D',
  },
  sky: {
    bg: '#F0F9FF',
    bgLight: '#F0F9FF',
    accent: '#0284C7',
    text: '#075985',
    border: '#7DD3FC',
  },
  rose: {
    bg: '#FFF1F2',
    bgLight: '#FFF1F2',
    accent: '#E11D48',
    text: '#9F1239',
    border: '#FDA4AF',
  },
  indigo: {
    bg: '#EEF2FF',
    bgLight: '#EEF2FF',
    accent: '#4F46E5',
    text: '#3730A3',
    border: '#A5B4FC',
  },
  emerald: {
    bg: '#ECFDF5',
    bgLight: '#ECFDF5',
    accent: '#059669',
    text: '#065F46',
    border: '#6EE7B7',
  },
  gray: {
    bg: '#F9FAFB',
    bgLight: '#F9FAFB',
    accent: '#4B5563',
    text: '#1F2937',
    border: '#D1D5DB',
  },
}

const DEFAULT_CATEGORIES: Category[] = []

const DEFAULT_FIELD_CONFIG: FieldConfig[] = [
  { id: 'quote', label: 'Quote', isBuiltIn: true, builtInKey: 'quote', isVisible: true, order: 0 },
  { id: 'context', label: 'Context', isBuiltIn: true, builtInKey: 'context', isVisible: true, order: 1 },
  { id: 'description', label: 'Omschrijving', isBuiltIn: true, builtInKey: 'description', isVisible: true, order: 2 },
  { id: 'tasks', label: 'Taken', isBuiltIn: true, builtInKey: 'tasks', isVisible: true, order: 3 },
]

// Legacy support - kept for backwards compatibility
const DEFAULT_TASKS_MODULE: TasksModuleConfig = {
  isVisible: true,
  label: 'Taken'
}

// ============================================================================
// ICONS (SVG)
// ============================================================================

function getPlusIcon(color: string): string {
  return `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5">
  <path d="M12 5v14M5 12h14"/>
</svg>
`
}

const CloseIcon = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
  <path d="M18 6L6 18M6 6l12 12"/>
</svg>
`


const EditIcon = `
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>
`

const TrashIcon = `
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
</svg>
`

const GearIcon = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2"/>
</svg>
`

const LinkuLogo = `
<svg width="38" height="12" viewBox="0 0 113 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M104.908 12.1572V29.0473H96.9606V12.1572H89.013V35.9999H104.908C109.297 35.9999 112.856 32.4412 112.856 28.0524V12.1572H104.908Z" fill="#2D6BFB"/>
<path d="M76.3291 12.1569L72.6497 17.4111L69.1439 22.4181V0L61.1963 2.11936V35.9997H69.1439V26.2624L72.6497 31.2664L75.9641 35.9997H85.6661L77.5007 24.3402L86.0311 12.1569H76.3291Z" fill="#2D6BFB"/>
<path d="M48.7451 12.1572H32.8499V35.9999H40.7975V19.1128H48.7451V35.9999H56.6927V20.1048C56.6927 15.7159 53.134 12.1572 48.7451 12.1572Z" fill="#2D6BFB"/>
<path d="M24.3726 8.41856C26.698 8.41856 28.5819 6.53469 28.5819 4.20928C28.5819 1.88387 26.698 0 24.3726 0C22.0472 0 20.1634 1.88387 20.1634 4.20928C20.1634 6.53469 22.0472 8.41856 24.3726 8.41856Z" fill="#2D6BFB"/>
<path d="M20.3989 12.1572H28.3465V35.9999H20.3989V12.1572Z" fill="#2D6BFB"/>
<path d="M15.8952 29.044V35.9997H7.94759C3.55875 35.9997 0 32.4409 0 28.0521V2.11936L7.94759 0V29.044H15.8952Z" fill="#2D6BFB"/>
</svg>
`

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Helper: Get field value from profile (built-in or custom)
// Note: 'tasks' is handled separately, not through this function
function getFieldValue(profile: Profile, fieldConfig: FieldConfig): string {
  if (fieldConfig.isBuiltIn && fieldConfig.builtInKey && fieldConfig.builtInKey !== 'tasks') {
    return profile[fieldConfig.builtInKey] || ''
  }
  return profile.customFields?.[fieldConfig.id] || ''
}

// Helper: Set field value in profile (built-in or custom)
// Note: 'tasks' is handled separately, not through this function
function setFieldValue(profile: Profile, fieldConfig: FieldConfig, value: string): Profile {
  if (fieldConfig.isBuiltIn && fieldConfig.builtInKey && fieldConfig.builtInKey !== 'tasks') {
    return { ...profile, [fieldConfig.builtInKey]: value }
  }
  return {
    ...profile,
    customFields: { ...(profile.customFields || {}), [fieldConfig.id]: value }
  }
}

function getNextProfileNumber(profiles: SyncedMap<Profile> | Map<string, Profile>): number {
  const numbers = Array.from(profiles.values()).map(p => {
    const match = p.id.match(/profile-(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  })
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1
}

// ============================================================================
// COMPONENTS: Mini Card (Collapsed State)
// ============================================================================

interface MiniCardProps {
  profile: Profile
  number: number
  colors: ColorScheme
  onExpand: () => void
  isSelected?: boolean
}

function MiniCard({ profile, number, colors, onExpand, isSelected = false }: MiniCardProps) {
  return (
    <AutoLayout
      direction="horizontal"
      spacing={10}
      padding={{ vertical: 10, horizontal: 12 }}
      cornerRadius={10}
      fill={isSelected ? colors.bgLight : "#FFFFFF"}
      stroke={isSelected ? colors.accent : colors.border}
      strokeWidth={isSelected ? 2 : 1}
      onClick={onExpand}
      hoverStyle={{ fill: colors.bgLight }}
      width="fill-parent"
      verticalAlignItems="center"
    >
      {/* Number badge */}
      <AutoLayout
        width={32}
        height={32}
        cornerRadius={8}
        fill={colors.accent}
        horizontalAlignItems="center"
        verticalAlignItems="center"
      >
        <Text
          fontSize={14}
          fontWeight={700}
          fill="#FFFFFF"
          fontFamily="Inter"
        >
          {number.toString().padStart(2, '0')}
        </Text>
      </AutoLayout>

      {/* Profile info */}
      <Text
        fontSize={13}
        fontWeight={600}
        fill="#1F2937"
        fontFamily="Inter"
        width="fill-parent"
      >
        {profile.shortName || profile.name}
      </Text>
    </AutoLayout>
  )
}

// ============================================================================
// COMPONENTS: Dynamic Field (Configurable Field Renderer)
// ============================================================================

interface DynamicFieldProps {
  config: FieldConfig
  value: string
  onChange: (value: string) => void
}

function DynamicField({ config, value, onChange }: DynamicFieldProps) {
  return (
    <AutoLayout width="fill-parent">
      <AutoLayout
        fill="#FFFFFF"
        cornerRadius={10}
        padding={12}
        direction="vertical"
        spacing={8}
        width="fill-parent"
      >
        <Text
          fontSize={10}
          fontWeight={600}
          fill="#6B7280"
          fontFamily="Inter"
          textCase="upper"
          letterSpacing={0.5}
        >
          {config.label}
        </Text>
        <Input
          value={value}
          placeholder={`${config.label}...`}
          onTextEditEnd={(e) => onChange(e.characters)}
          fontSize={13}
          fill="#1F2937"
          fontFamily="Inter"
          width="fill-parent"
          inputBehavior="multiline"
        />
      </AutoLayout>
    </AutoLayout>
  )
}

// ============================================================================
// COMPONENTS: Expanded Card (Detail View)
// ============================================================================

interface ExpandedCardProps {
  profile: Profile
  number: number
  category: Category | null
  colors: ColorScheme
  onCollapse: () => void
  onUpdate: (profile: Profile) => void
  onDelete: () => void
  onEditCategory: () => void
  widgetSettings: WidgetSettings
}

function ExpandedCard({
  profile,
  number,
  category,
  colors,
  onCollapse,
  onUpdate,
  onDelete,
  onEditCategory,
  widgetSettings,
}: ExpandedCardProps) {
  // Sort fields by order, filter visible
  const visibleFields = widgetSettings.fields
    .filter(f => f.isVisible)
    .sort((a, b) => a.order - b.order)

  // Helper to render tasks field
  const renderTasksField = (fieldConfig: FieldConfig) => (
    <AutoLayout key={fieldConfig.id} width="fill-parent">
      <AutoLayout
        fill="#FFFFFF"
        cornerRadius={10}
        padding={12}
        direction="vertical"
        spacing={8}
        width="fill-parent"
      >
        <AutoLayout
          direction="horizontal"
          width="fill-parent"
          verticalAlignItems="center"
          spacing={0}
        >
          <Text
            fontSize={10}
            fontWeight={600}
            fill="#6B7280"
            fontFamily="Inter"
            textCase="upper"
            letterSpacing={0.5}
          >
            {fieldConfig.label} ({profile.tasks.length})
          </Text>
          <AutoLayout width="fill-parent" height={1} />
          <AutoLayout
            padding={{ horizontal: 8, vertical: 4 }}
            cornerRadius={6}
            fill={colors.bgLight}
            onClick={() => {
              onUpdate({ ...profile, tasks: [...profile.tasks, 'Nieuwe taak'] })
            }}
            hoverStyle={{ fill: colors.border }}
          >
            <Text fontSize={11} fill={colors.text} fontFamily="Inter">+ Taak</Text>
          </AutoLayout>
        </AutoLayout>

        {profile.tasks.length > 0 ? (
          <AutoLayout direction="vertical" spacing={4} width="fill-parent">
            {profile.tasks.map((task, index) => (
              <AutoLayout
                key={index}
                direction="horizontal"
                spacing={8}
                width="fill-parent"
                verticalAlignItems="center"
              >
                <AutoLayout
                  width={6}
                  height={6}
                  cornerRadius={3}
                  fill={colors.accent}
                />
                <Input
                  value={task}
                  placeholder="Taak..."
                  onTextEditEnd={(e) => {
                    const newTasks = [...profile.tasks]
                    if (e.characters.trim() === '') {
                      newTasks.splice(index, 1)
                    } else {
                      newTasks[index] = e.characters
                    }
                    onUpdate({ ...profile, tasks: newTasks })
                  }}
                  fontSize={12}
                  fill="#1F2937"
                  fontFamily="Inter"
                  width="fill-parent"
                />
              </AutoLayout>
            ))}
          </AutoLayout>
        ) : (
          <Text fontSize={12} fill="#6B7280" fontFamily="Inter">
            Nog geen taken toegevoegd
          </Text>
        )}
      </AutoLayout>
    </AutoLayout>
  )

  return (
    <AutoLayout
      direction="vertical"
      spacing={12}
      padding={24}
      cornerRadius={12}
      fill={colors.bg}
      stroke={colors.accent}
      strokeWidth={2}
      width="fill-parent"
    >
      {/* Header */}
      <AutoLayout
        direction="horizontal"
        spacing={12}
        width="fill-parent"
        verticalAlignItems="start"
      >
        {/* Number badge - large */}
        <AutoLayout
          width={52}
          height={52}
          cornerRadius={12}
          fill={colors.accent}
          horizontalAlignItems="center"
          verticalAlignItems="center"
        >
          <Text
            fontSize={22}
            fontWeight={700}
            fill="#FFFFFF"
            fontFamily="Inter"
          >
            {number.toString().padStart(2, '0')}
          </Text>
        </AutoLayout>

        {/* Title section */}
        <AutoLayout direction="vertical" spacing={4} width="fill-parent">
          <AutoLayout 
            direction="horizontal" 
            spacing={6} 
            verticalAlignItems="center"
            padding={{ horizontal: 8, vertical: 4 }}
            cornerRadius={6}
            onClick={onEditCategory}
            hoverStyle={{ fill: '#F3F4F6' }}
            tooltip="Categorie wijzigen"
          >
            <Text fontSize={12} fill={colors.text} fontFamily="Inter">
              {category?.icon || '📂'}
            </Text>
            <Text
              fontSize={11}
              fontWeight={600}
              fill={colors.text}
              fontFamily="Inter"
              textCase="upper"
              letterSpacing={0.5}
            >
              {category?.name || 'Geen categorie'}
            </Text>
            <SVG src={EditIcon} />
          </AutoLayout>
          <Input
            value={profile.name}
            placeholder="Profielnaam..."
            onTextEditEnd={(e) => onUpdate({ ...profile, name: e.characters })}
            fontSize={18}
            fontWeight={700}
            fill="#1F2937"
            fontFamily="Inter"
            width="fill-parent"
            inputBehavior="multiline"
          />
        </AutoLayout>

        {/* Close button */}
        <AutoLayout
          width={32}
          height={32}
          cornerRadius={8}
          fill="#FFFFFF"
          horizontalAlignItems="center"
          verticalAlignItems="center"
          onClick={onCollapse}
          hoverStyle={{ fill: '#F3F4F6' }}
        >
          <SVG src={CloseIcon} />
        </AutoLayout>
      </AutoLayout>

      {/* Dynamic Fields - tasks field has special rendering */}
      {visibleFields.map((fieldConfig) => {
        if (fieldConfig.builtInKey === 'tasks') {
          return renderTasksField(fieldConfig)
        }
        return (
          <DynamicField
            key={fieldConfig.id}
            config={fieldConfig}
            value={getFieldValue(profile, fieldConfig)}
            onChange={(value) => {
              const updatedProfile = setFieldValue(profile, fieldConfig, value)
              onUpdate(updatedProfile)
            }}
          />
        )
      })}

      {/* Footer with delete */}
      <AutoLayout
        width="fill-parent"
      >
        <AutoLayout
          fill="#FFFFFF"
          cornerRadius={10}
          padding={12}
          width="fill-parent"
          horizontalAlignItems="center"
        >
          <AutoLayout
            padding={{ horizontal: 12, vertical: 6 }}
            cornerRadius={6}
            onClick={onDelete}
            hoverStyle={{ fill: '#FEE2E2' }}
          >
            <Text fontSize={11} fill="#DC2626" fontFamily="Inter">
              Profiel verwijderen
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

// ============================================================================
// COMPONENTS: Stat Box
// ============================================================================

interface StatBoxProps {
  label: string
  value: string
  colors: ColorScheme
  editable?: boolean
  onEdit?: () => void
}

function StatBox({ label, value, colors, editable = false, onEdit }: StatBoxProps) {
  return (
    <AutoLayout
      fill="#FFFFFF"
      cornerRadius={8}
      padding={10}
      direction="vertical"
      spacing={2}
      horizontalAlignItems="center"
      width="fill-parent"
      onClick={editable ? onEdit : undefined}
      hoverStyle={editable ? { fill: '#F9FAFB' } : undefined}
    >
      <Text
        fontSize={15}
        fontWeight={700}
        fill={colors.text}
        fontFamily="Inter"
      >
        {value}
      </Text>
      <AutoLayout direction="horizontal" spacing={2} verticalAlignItems="center">
        <Text fontSize={10} fill="#6B7280" fontFamily="Inter">
          {label}
        </Text>
        {editable && <SVG src={EditIcon} />}
      </AutoLayout>
    </AutoLayout>
  )
}

// ============================================================================
// COMPONENTS: Category Section
// ============================================================================

interface CategorySectionProps {
  category: Category
  profiles: Profile[]
  allProfiles: SyncedMap<Profile>
  expandedId: string | null
  onExpand: (id: string | null) => void
  onUpdateProfile: (profile: Profile) => void
  onDeleteProfile: (id: string) => void
  onAddProfile: () => void
  onEditCategory: () => void | Promise<void>
  onDeleteCategory: () => void
}

function CategorySection({
  category,
  profiles,
  allProfiles,
  expandedId,
  onExpand,
  onUpdateProfile,
  onDeleteProfile,
  onAddProfile,
  onEditCategory,
  onDeleteCategory,
}: CategorySectionProps) {
  const colors = COLORS[category.colorKey] || COLORS.pink

  const getProfileNumber = (profile: Profile): number => {
    const allProfilesSorted = Array.from(allProfiles.values())
      .sort((a, b) => a.id.localeCompare(b.id))
    return allProfilesSorted.findIndex(p => p.id === profile.id) + 1
  }

  return (
    <AutoLayout
      direction="vertical"
      spacing={0}
      width="fill-parent"
      fill={colors.bg}
      cornerRadius={12}
      stroke={colors.border}
      strokeWidth={1}
    >
      {/* Category header */}
      <AutoLayout
        direction="horizontal"
        spacing={10}
        padding={{ vertical: 8, horizontal: 12 }}
        cornerRadius={{ topLeft: 12, topRight: 12, bottomLeft: 0, bottomRight: 0 }}
        width="fill-parent"
        verticalAlignItems="center"
      >
        <AutoLayout direction="horizontal" spacing={6} verticalAlignItems="center" width="fill-parent">
          <Text fontSize={16} fontFamily="Inter">{category.icon}</Text>
          <Text
            fontSize={14}
            fontWeight={600}
            fill={colors.text}
            fontFamily="Inter"
            width="fill-parent"
          >
            {category.name}
          </Text>
        </AutoLayout>

        <AutoLayout
          direction="horizontal"
          spacing={8}
          verticalAlignItems="center"
          padding={{ left: 8 }}
        >
          {/* Subtle Count Badge */}
          <AutoLayout
            fill={colors.bg}
            cornerRadius={8}
            padding={{ horizontal: 6, vertical: 2 }}
            stroke={colors.border}
            strokeWidth={1}
          >
            <Text
              fontSize={10}
              fontWeight={600}
              fill={colors.text}
              fontFamily="Inter"
            >
              {profiles.length}
            </Text>
          </AutoLayout>

          {/* Action Group */}
          <AutoLayout direction="horizontal" spacing={4} verticalAlignItems="center">
            {/* Only show edit and delete buttons for actual categories (not uncategorized) */}
            {category.id !== '' && (
              <>
                <AutoLayout
                  padding={6}
                  cornerRadius={6}
                  onClick={onEditCategory}
                  hoverStyle={{ fill: '#F3F4F6' }}
                  tooltip="Bewerken"
                >
                  <SVG src={EditIcon} />
                </AutoLayout>
                <AutoLayout
                  padding={6}
                  cornerRadius={6}
                  onClick={onDeleteCategory}
                  hoverStyle={{ fill: '#FEE2E2' }}
                  tooltip="Verwijderen"
                >
                  <SVG src={TrashIcon} />
                </AutoLayout>
              </>
            )}

            {/* Compact Plus Button */}
            <AutoLayout
              width={28}
              height={28}
              cornerRadius={14}
              fill="#FFFFFF"
              stroke={colors.border}
              strokeWidth={1}
              horizontalAlignItems="center"
              verticalAlignItems="center"
              onClick={onAddProfile}
              hoverStyle={{ fill: '#F9FAFB' }}
              tooltip="Nieuw profiel"
            >
              <SVG src={getPlusIcon(colors.accent)} />
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      {/* Profile cards */}
      {profiles.length > 0 ? (
        <AutoLayout
          direction="vertical"
          spacing={8}
          width="fill-parent"
          padding={{ top: 0, bottom: 12, left: 12, right: 12 }}
        >
          {profiles.map((profile) => {
            const profileNumber = getProfileNumber(profile)

            return (
              <MiniCard
                key={profile.id}
                profile={profile}
                number={profileNumber}
                colors={colors}
                onExpand={() => onExpand(profile.id)}
                isSelected={expandedId === profile.id}
              />
            )
          })}
        </AutoLayout>
      ) : (
        <AutoLayout
          padding={12}
          horizontalAlignItems="center"
          width="fill-parent"
        >
          <Text fontSize={12} fill="#6B7280" fontFamily="Inter">
            Nog geen profielen in deze categorie
          </Text>
        </AutoLayout>
      )}
    </AutoLayout>
  )
}

// ============================================================================
// COMPONENTS: Detail Panel (Right Side)
// ============================================================================

interface DetailPanelProps {
  expandedProfile: Profile | null
  profileNumber: number
  category: Category | null
  onCollapse: () => void
  onUpdate: (profile: Profile) => void
  onDelete: () => void
  onEditCategory: () => void
  widgetSettings: WidgetSettings
}

function DetailPanel({
  expandedProfile,
  profileNumber,
  category,
  onCollapse,
  onUpdate,
  onDelete,
  onEditCategory,
  widgetSettings,
}: DetailPanelProps) {
  if (!expandedProfile) {
    return (
      <AutoLayout
        direction="vertical"
        padding={24}
        width="fill-parent"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        fill="#F9FAFB"
        cornerRadius={12}
      >
        <Text fontSize={13} fill="#6B7280" fontFamily="Inter">
          Klik op een profiel om{'\n'}details te bekijken
        </Text>
      </AutoLayout>
    )
  }

  // Use gray color scheme for uncategorized profiles
  const colors = category ? (COLORS[category.colorKey] || COLORS.pink) : COLORS.gray

  return (
    <AutoLayout
      direction="vertical"
      width="fill-parent"
    >
      <ExpandedCard
        profile={expandedProfile}
        number={profileNumber}
        category={category}
        colors={colors}
        onCollapse={onCollapse}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEditCategory={onEditCategory}
        widgetSettings={widgetSettings}
      />
    </AutoLayout>
  )
}

// ============================================================================
// MAIN WIDGET
// ============================================================================

function UserProfilesWidget() {
  const widgetId = useWidgetNodeId()

  // State: which profile is expanded (null = none)
  const [expandedId, setExpandedId] = useSyncedState<string | null>('expandedId', null)

  // State: all profiles using SyncedMap for concurrent editing support
  const profilesMap = useSyncedMap<Profile>('profiles')

  // State: categories
  const [categories, setCategories] = useSyncedState<Category[]>('categories', DEFAULT_CATEGORIES)

  // State: widget title
  const [widgetTitle, setWidgetTitle] = useSyncedState('widgetTitle', 'Gebruikersprofielen')

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
      // Check if there's a legacy tasksModule property
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
        tooltip: 'Widget instellingen',
      },
      {
        itemType: 'separator',
      },
      {
        itemType: 'action',
        propertyName: 'addProfile',
        tooltip: 'Profiel toevoegen',
      },
      {
        itemType: 'action',
        propertyName: 'addCategory',
        tooltip: 'Categorie toevoegen',
      },
      {
        itemType: 'separator',
      },
      {
        itemType: 'action',
        propertyName: 'exportJson',
        tooltip: 'Exporteer JSON',
      },
      {
        itemType: 'action',
        propertyName: 'importJson',
        tooltip: 'Importeer JSON',
      },
    ],
    ({ propertyName }) => {
      switch (propertyName) {
        case 'openSettings':
          return showSettingsUI()
        case 'addProfile':
          // Add uncategorized profile (categoryId = '')
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
    figma.ui.onmessage = (msg: { type: string; id?: string; name?: string; icon?: string; color?: string; data?: string; profileId?: string; categoryId?: string; deleteType?: string; settings?: WidgetSettings }) => {
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
        figma.notify(`Categorie "${msg.name}" toegevoegd`)
      }

      if (msg.type === 'updateCategory' && msg.id && msg.name) {
        const updatedCategories = categories.map(cat =>
          cat.id === msg.id
            ? { ...cat, name: msg.name!, icon: msg.icon || '👤', colorKey: (msg.color as ColorKey) || 'pink' }
            : cat
        )
        setCategories(updatedCategories)
        figma.closePlugin()
        figma.notify(`Categorie "${msg.name}" bijgewerkt`)
      }

      if (msg.type === 'importData' && msg.data) {
        try {
          const data = JSON.parse(msg.data)
          
          // Import widget title
          if (data.widgetTitle) {
            setWidgetTitle(data.widgetTitle)
          }
          
          // Import widget settings (field configuration)
          if (data.widgetSettings) {
            setWidgetSettings(data.widgetSettings)
          }
          
          // Import categories
          if (data.categories) {
            setCategories(data.categories)
          }
          
          // Import profiles (with legacy field cleanup)
          if (data.profiles) {
            profilesMap.keys().forEach(key => profilesMap.delete(key))
            Object.entries(data.profiles).forEach(([key, profile]) => {
              // Strip legacy fields (level, orgSize) if present
              const { level, orgSize, ...cleanProfile } = profile as Profile & { level?: string; orgSize?: string }
              profilesMap.set(key, cleanProfile as Profile)
            })
          }
          
          figma.closePlugin()
          figma.notify('Data succesvol geïmporteerd')
        } catch (e) {
          figma.notify('Fout bij importeren: ongeldig JSON formaat', { error: true })
        }
      }

      if (msg.type === 'uiReady') {
        exportData(true)
      }

      if (msg.type === 'exportComplete') {
        figma.closePlugin()
        figma.notify('Data gekopieerd naar klembord')
      }

      if (msg.type === 'exportError') {
        figma.closePlugin()
        figma.notify('Fout bij kopiëren naar klembord', { error: true })
      }

      if (msg.type === 'updateProfileCategory' && msg.profileId) {
        const profile = profilesMap.get(msg.profileId)
        if (profile) {
          updateProfile({ ...profile, categoryId: msg.categoryId || '' })
          figma.closePlugin()
          figma.notify('Categorie bijgewerkt')
        }
      }

      if (msg.type === 'confirmDelete' && msg.deleteType && msg.id) {
        if (msg.deleteType === 'profile') {
          deleteProfile(msg.id)
          figma.notify('Profiel verwijderd')
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

      if (msg.type === 'updateSettings' && msg.settings) {
        setWidgetSettings(msg.settings)
        figma.closePlugin()
        figma.notify('Instellingen opgeslagen')
      }

      if (msg.type === 'cancelSettings') {
        figma.closePlugin()
      }
    }
  })

  // Helper: Show category form UI (add or edit)
  function showCategoryFormUI(initialData?: Category) {
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

    // Color swatches with accent colors from COLORS
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

    return new Promise<void>(() => {
      figma.showUI(
        `<!DOCTYPE html>
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
          <h3>${initialData ? 'Categorie bewerken' : 'Nieuwe categorie'}</h3>
          <input type="hidden" id="id" value="${initialData?.id || ''}">
          
          <label>Naam</label>
          <input id="name" type="text" placeholder="Bijv. Zorgprofessionals" value="${initialData?.name || ''}">
          
          <div class="icon-section">
            <label>Icon</label>
            <input id="icon" type="text" placeholder="👤" maxlength="2" value="${initialData?.icon || ''}">
            <div class="preset-grid">${presetButtons}</div>
          </div>
          
          <div class="color-section">
            <label>Kleur</label>
            <div class="color-swatches">${swatchButtons}</div>
            <input type="hidden" id="color" value="${initialData?.colorKey || 'pink'}">
          </div>
          
          <button type="button" class="submit-btn" id="submit">${initialData ? 'Opslaan' : 'Toevoegen'}</button>
          <script>
            const iconInput = document.getElementById('icon');
            const colorInput = document.getElementById('color');
            const presetBtns = document.querySelectorAll('.preset-btn');
            const swatchBtns = document.querySelectorAll('.swatch');
            
            // Update which preset button is highlighted based on input value
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
            
            // Update which swatch is highlighted based on color value
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
            
            // Handle preset button clicks
            presetBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                iconInput.value = btn.dataset.emoji;
                updatePresetHighlight();
              });
            });
            
            // Handle swatch button clicks
            swatchBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                colorInput.value = btn.dataset.color;
                updateSwatchHighlight();
              });
            });
            
            // Update highlight when input changes
            iconInput.addEventListener('input', updatePresetHighlight);
            
            // Initial highlights on load
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
            // Focus name field
            document.getElementById('name').focus()
            
            // Select text if editing
            if ('${initialData?.id || ''}') {
                document.getElementById('name').select()
            }
          </script>
        </body>
        </html>`,
        { width: 320, height: 520 }
      )
    })
  }

  // Helper: Show delete confirmation UI
  function showDeleteConfirmationUI(
    type: 'profile' | 'category',
    id: string,
    name: string,
    profileCount?: number
  ) {
    const title = type === 'profile' ? 'Profiel verwijderen' : 'Categorie verwijderen'
    let message = ''
    
    if (type === 'profile') {
      message = `Weet je zeker dat je "${name}" wilt verwijderen?`
    } else {
      if (profileCount && profileCount > 0) {
        message = `Weet je zeker dat je categorie "${name}" wilt verwijderen?<br><br><strong>${profileCount} profiel${profileCount > 1 ? 'en' : ''} ${profileCount > 1 ? 'worden' : 'wordt'} automatisch verplaatst naar "Ongecategoriseerd".</strong>`
      } else {
        message = `Weet je zeker dat je categorie "${name}" wilt verwijderen?`
      }
    }
    
    return new Promise<void>(() => {
      figma.showUI(
        `<!DOCTYPE html>
        <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; }
            h3 { font-size: 14px; margin-bottom: 12px; color: #1f2937; font-weight: 600; }
            p { font-size: 13px; color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
            .buttons { display: flex; gap: 8px; }
            button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
            .cancel { background: #F3F4F6; color: #374151; }
            .cancel:hover { background: #E5E7EB; }
            .delete { background: #EF4444; color: white; }
            .delete:hover { background: #DC2626; }
          </style>
        </head>
        <body>
          <h3>${title}</h3>
          <p>${message}</p>
          <input type="hidden" id="id" value="${id}">
          <input type="hidden" id="type" value="${type}">
          <div class="buttons">
            <button class="cancel" id="cancel">Annuleren</button>
            <button class="delete" id="delete">Verwijderen</button>
          </div>
          <script>
            document.getElementById('cancel').onclick = () => {
              parent.postMessage({ pluginMessage: { type: 'cancelDelete' } }, '*')
            }
            document.getElementById('delete').onclick = () => {
              const id = document.getElementById('id').value
              const deleteType = document.getElementById('type').value
              parent.postMessage({ pluginMessage: { type: 'confirmDelete', deleteType, id } }, '*')
            }
            document.getElementById('cancel').focus()
          </script>
        </body>
        </html>`,
        { width: 320, height: 240, title: title }
      )
    })
  }

  // Helper: Show import UI
  function showImportUI() {
    return new Promise<void>(() => {
      figma.showUI(
        `<!DOCTYPE html>
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
          <h3>Importeer JSON</h3>
          <p class="hint">Plak hier de geëxporteerde JSON data</p>
          <textarea id="data" placeholder='{"widgetTitle": "...", "widgetSettings": {...}, "categories": [...], "profiles": {...}}'></textarea>
          <button id="submit">Importeren</button>
          <script>
            document.getElementById('submit').onclick = () => {
              const data = document.getElementById('data').value.trim()
              if (data) {
                parent.postMessage({ pluginMessage: { type: 'importData', data } }, '*')
              }
            }
          </script>
        </body>
        </html>`,
        { width: 320, height: 340 }
      )
    })
  }

  // Helper: Show category picker UI for profile
  function showCategoryPickerUI(profileId: string, currentCategoryId: string) {
    const categoryOptions = [
      `<option value="" ${currentCategoryId === '' ? 'selected' : ''}>Geen categorie</option>`,
      ...categories.map(cat =>
        `<option value="${cat.id}" ${currentCategoryId === cat.id ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
      )
    ].join('')

    return new Promise<void>(() => {
      figma.showUI(
        `<!DOCTYPE html>
        <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Inter, -apple-system, sans-serif; padding: 16px; background: #fff; }
            h3 { font-size: 14px; margin-bottom: 16px; color: #1f2937; }
            label { display: block; font-size: 11px; font-weight: 500; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            select { width: 100%; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
            select:focus { outline: none; border-color: #2D6BFB; }
            button { width: 100%; padding: 12px; background: #2D6BFB; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
            button:hover { background: #1E5BD9; }
          </style>
        </head>
        <body>
          <h3>Selecteer categorie</h3>
          <input type="hidden" id="profileId" value="${profileId}">
          <label>Categorie</label>
          <select id="categoryId">${categoryOptions}</select>
          <button id="submit">Opslaan</button>
          <script>
            document.getElementById('submit').onclick = () => {
              const profileId = document.getElementById('profileId').value
              const categoryId = document.getElementById('categoryId').value
              parent.postMessage({ pluginMessage: { type: 'updateProfileCategory', profileId, categoryId } }, '*')
            }
            document.getElementById('categoryId').focus()
          </script>
        </body>
        </html>`,
        { width: 280, height: 200 }
      )
    })
  }

  // Helper: Show settings UI
  function showSettingsUI() {
    const settingsData = JSON.stringify(migratedSettings)
    
    return new Promise<void>(() => {
      figma.showUI(
        `<!DOCTYPE html>
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
          </style>
        </head>
        <body>
          <h3>Profielvelden</h3>
          <p class="subtitle">Bepaal welke velden zichtbaar zijn en in welke volgorde</p>
          
          <div id="fieldList" class="field-list"></div>
          <button type="button" class="add-field-btn" id="addFieldBtn">+ Nieuw veld toevoegen</button>
          
          <div class="buttons">
            <button type="button" class="cancel-btn" id="cancelBtn">Annuleren</button>
            <button type="button" class="save-btn" id="saveBtn">Opslaan</button>
          </div>
          
          <script>
            const settingsJson = '${settingsData.replace(/'/g, "\\'")}';
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
                
                // Visibility button
                const visBtn = document.createElement('button');
                visBtn.type = 'button';
                visBtn.className = 'visibility-btn';
                visBtn.innerHTML = field.isVisible ? eyeOpenSvg : eyeClosedSvg;
                visBtn.title = field.isVisible ? 'Verbergen' : 'Tonen';
                visBtn.onclick = () => {
                  field.isVisible = !field.isVisible;
                  renderFields();
                };
                item.appendChild(visBtn);
                
                // Label input
                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.value = field.label || '';
                labelInput.placeholder = 'Veldnaam...';
                labelInput.className = 'field-label-input';
                labelInput.oninput = (e) => { field.label = e.target.value; };
                item.appendChild(labelInput);
                
                // Built-in badge
                if (field.isBuiltIn) {
                  const badge = document.createElement('span');
                  badge.className = 'builtin-badge';
                  badge.textContent = 'Standaard';
                  item.appendChild(badge);
                }
                
                // Controls
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
                
                // Delete (custom fields only)
                if (!field.isBuiltIn) {
                  const delBtn = document.createElement('button');
                  delBtn.type = 'button';
                  delBtn.className = 'delete-btn';
                  delBtn.innerHTML = trashSvg;
                  delBtn.onclick = () => {
                    if (confirm('Veld verwijderen? Alle data gaat verloren.')) {
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
              parent.postMessage({ pluginMessage: { type: 'updateSettings', settings: settings } }, '*');
            };
            
            renderFields();
          </script>
        </body>
        </html>`,
        { width: 380, height: 420, title: 'Profielvelden' }
      )
    })
  }

  // Helper: Export data
  function exportData(sendPayload = false) {
    // Phase 2: Send data when UI is ready
    if (sendPayload) {
      const profiles: Record<string, Profile> = {}
      // Fix: Use Array.from to iterate over the SyncedMap entries iterator
      Array.from(profilesMap.entries()).forEach(([key, profile]) => {
        // Clean profile: ensure no legacy fields are exported
        const { description, quote, tasks, context, customFields, id, name, shortName, categoryId } = profile
        profiles[key] = {
          id,
          name,
          shortName,
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

    // Phase 1: Open UI
    return new Promise<void>(() => {
      figma.notify('Export gestart...')
      figma.showUI(
        `<!DOCTYPE html>
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
            <div id="status">Laden...</div>
          </div>

          <div id="manual-state">
            <h3>Exporteer JSON</h3>
            <p>Kopieer de JSON data hieronder handmatig:</p>
            <textarea id="data" readonly></textarea>
            <button id="closeBtn">Sluiten</button>
          </div>

          <script>
            const status = document.getElementById('status');
            const initialState = document.getElementById('initial-state');
            const manualState = document.getElementById('manual-state');
            const dataArea = document.getElementById('data');
            const closeBtn = document.getElementById('closeBtn');

            // Notify plugin we are ready
            window.parent.postMessage({ pluginMessage: { type: 'uiReady' } }, '*');

            // Listen for data
            window.onmessage = async (event) => {
              const msg = event.data.pluginMessage;
              if (msg && msg.type === 'exportPayload') {
                status.innerText = 'Bezig met kopiëren...';
                dataArea.value = msg.data;
                await attemptCopy();
              }
            }

            function copySuccess() {
              status.className = 'success';
              status.innerText = 'Gekopieerd!';
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
      </html>`,
        { width: 400, height: 350, title: 'Export JSON' }
      )
    })
  }

  // Helper: Add new profile
  function addProfile(categoryId: string) {
    const newId = `profile-${getNextProfileNumber(profilesMap)}`
    const newProfile: Profile = {
      id: newId,
      name: 'Nieuw profiel',
      shortName: 'Nieuw',
      categoryId,
      description: '',
      quote: '',
      tasks: [],
      context: '',
    }
    profilesMap.set(newId, newProfile)
    setExpandedId(newId)
  }

  // Helper: Update profile
  function updateProfile(profile: Profile) {
    if (profile.name && profile.name !== 'Nieuw profiel') {
      const words = profile.name.split(' ')
      profile.shortName = words.length > 2
        ? words.slice(0, 2).join(' ')
        : profile.name
    }
    profilesMap.set(profile.id, profile)
  }

  // Helper: Delete profile
  function deleteProfile(id: string) {
    profilesMap.delete(id)
    if (expandedId === id) {
      setExpandedId(null)
    }
  }

  // Helper: Get profiles for category
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

  // Helper: Delete category (with confirmation)
  function deleteCategory(category: Category) {
    const profiles = getProfilesForCategory(category.id)
    return showDeleteConfirmationUI('category', category.id, category.name, profiles.length)
  }

  // Helper: Actually delete category (called after confirmation)
  function actualDeleteCategory(category: Category) {
    // Verplaats profielen naar ongecategoriseerd
    const profiles = getProfilesForCategory(category.id)
    profiles.forEach(profile => {
      profilesMap.set(profile.id, { ...profile, categoryId: '' })
    })
    
    // Verwijder de categorie
    const newCategories = categories.filter(c => c.id !== category.id)
    setCategories(newCategories)
    
    // Toon passende melding
    const message = profiles.length > 0
      ? `Categorie "${category.name}" verwijderd. ${profiles.length} profiel${profiles.length > 1 ? 'en' : ''} verplaatst.`
      : `Categorie "${category.name}" verwijderd`
    figma.notify(message)
  }

  // Auto-select first profile on initial load ONLY if none is selected
  useEffect(() => {
    if (!expandedId && profilesMap.size > 0) {
      // NOTE: We removed the auto-re-select logic here to allow the user 
      // to explicitly close the detail panel. Startup selection can be handled 
      // by a dedicated flag or by checking if it's the very first render.
    }
  })

  // Calculate totals
  const totalProfiles = profilesMap.size

  // Get expanded profile and category
  const expandedProfile: Profile | null = expandedId ? (profilesMap.get(expandedId) ?? null) : null
  const expandedCategory: Category | null = expandedProfile
    ? (categories.find(cat => cat.id === expandedProfile.categoryId) ?? null)
    : null
  const expandedProfileNumber = expandedProfile
    ? Array.from(profilesMap.values())
      .sort((a, b) => a.id.localeCompare(b.id))
      .findIndex(p => p.id === expandedProfile.id) + 1
    : 0

  // Render
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
            {totalProfiles} profiel{totalProfiles !== 1 ? 'en' : ''} · {categories.length} categorie{categories.length !== 1 ? 'ën' : ''}
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
                tooltip={cat.name}
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
                tooltip="Ongecategoriseerd"
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
            Tip: Pas profielvelden aan via Widget instellingen in het menu.
          </Text>
          <AutoLayout
            width={20}
            height={20}
            cornerRadius={4}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            onClick={() => setShowTip(false)}
            hoverStyle={{ fill: '#E0F2FE' }}
            tooltip="Tip verbergen"
          >
            <SVG src={CloseIcon} />
          </AutoLayout>
        </AutoLayout>
      )}

      {/* Empty state - Full width, Profile First */}
      {categories.length === 0 && profilesMap.size === 0 && (
        <AutoLayout
          fill="#F9FAFB"
          cornerRadius={12}
          width="fill-parent"
          horizontalAlignItems="center"
          verticalAlignItems="center"
          padding={48}
        >
          <AutoLayout
            direction="vertical"
            spacing={16}
            horizontalAlignItems="center"
            width={480}
          >
            {/* Title */}
            <Text 
              fontSize={20} 
              fontWeight={700} 
              fill="#1F2937" 
              fontFamily="Inter"
              horizontalAlignText="center"
            >
              Al je doelgroepinformatie in één overzicht
            </Text>

            {/* Subtitle */}
            <Text 
              fontSize={14} 
              fill="#6B7280" 
              fontFamily="Inter"
              horizontalAlignText="center"
            >
              Maak profielen, groepeer ze in categorieën, en deel ze met je team.
            </Text>

            {/* Primary CTA Button */}
            <AutoLayout
              fill="#2D6BFB"
              cornerRadius={8}
              padding={{ horizontal: 20, vertical: 12 }}
              onClick={() => addProfile('')}
              hoverStyle={{ fill: '#1E5BD9' }}
            >
              <Text 
                fontSize={14} 
                fontWeight={600} 
                fill="#FFFFFF" 
                fontFamily="Inter"
              >
                + Eerste profiel toevoegen
              </Text>
            </AutoLayout>

            {/* Pro Tip Footer */}
            <AutoLayout
              fill="#FFFFFF"
              stroke="#E5E7EB"
              strokeWidth={1}
              cornerRadius={8}
              padding={16}
              width="fill-parent"
              horizontalAlignItems="center"
              spacing={0}
            >
              <Text 
                fontSize={12} 
                fill="#6B7280" 
                fontFamily="Inter"
                horizontalAlignText="center"
                width="fill-parent"
              >
                💡 Tip: Pas profielvelden aan via Widget instellingen. Voeg eigen velden toe of verberg wat je niet nodig hebt.
              </Text>
            </AutoLayout>

            {/* Linku branding */}
            <AutoLayout
              direction="horizontal"
              spacing={6}
              horizontalAlignItems="center"
              verticalAlignItems="center"
            >
              <Text 
                fontSize={12} 
                fill="#9CA3AF" 
                fontFamily="Inter"
              >
                Een tool van
              </Text>
              <SVG src={LinkuLogo} />
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
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
              .map((category) => (
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
                />
              ))}

            {/* Uncategorized section */}
            {getProfilesForCategory('').length > 0 && (
              <CategorySection
                key="uncategorized"
                category={{
                  id: '',
                  name: 'Ongecategoriseerd',
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
              />
            )}
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
          />
        </AutoLayout>
      )}

    </AutoLayout>
  )
}

// Register the widget
register(UserProfilesWidget)