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
  level: 'Basis' | 'Gevorderd' | 'Expert'
  orgSize: 'S' | 'M' | 'L' | 'XL' | 'Alle' | 'Extern'
  description: string
  quote: string
  tasks: string[]
  context: string
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

// ============================================================================
// CONSTANTS & DESIGN TOKENS
// ============================================================================

const COLORS: Record<ColorKey, ColorScheme> = {
  pink: {
    bg: '#FDF2F8',
    bgLight: '#FDF2F8',
    accent: '#EC4899',
    text: '#BE185D',
    border: '#F9A8D4',
  },
  teal: {
    bg: '#F0FDFA',
    bgLight: '#F0FDFA',
    accent: '#14B8A6',
    text: '#0F766E',
    border: '#5EEAD4',
  },
  purple: {
    bg: '#FAF5FF',
    bgLight: '#FAF5FF',
    accent: '#A855F7',
    text: '#7E22CE',
    border: '#D8B4FE',
  },
  amber: {
    bg: '#FFFBEB',
    bgLight: '#FFFBEB',
    accent: '#F59E0B',
    text: '#B45309',
    border: '#FCD34D',
  },
  sky: {
    bg: '#F0F9FF',
    bgLight: '#F0F9FF',
    accent: '#0EA5E9',
    text: '#0369A1',
    border: '#7DD3FC',
  },
  rose: {
    bg: '#FFF1F2',
    bgLight: '#FFF1F2',
    accent: '#F43F5E',
    text: '#BE123C',
    border: '#FDA4AF',
  },
  indigo: {
    bg: '#EEF2FF',
    bgLight: '#EEF2FF',
    accent: '#6366F1',
    text: '#4338CA',
    border: '#A5B4FC',
  },
  emerald: {
    bg: '#ECFDF5',
    bgLight: '#ECFDF5',
    accent: '#10B981',
    text: '#047857',
    border: '#6EE7B7',
  },
  gray: {
    bg: '#F9FAFB',
    bgLight: '#F9FAFB',
    accent: '#6B7280',
    text: '#374151',
    border: '#D1D5DB',
  },
}

const DEFAULT_CATEGORIES: Category[] = []

// ============================================================================
// ICONS (SVG)
// ============================================================================

const PlusIcon = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2.5">
  <path d="M12 5v14M5 12h14"/>
</svg>
`

const CloseIcon = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
  <path d="M18 6L6 18M6 6l12 12"/>
</svg>
`


const EditIcon = `
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>
`

const TrashIcon = `
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
</svg>
`

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
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
      <AutoLayout direction="vertical" spacing={2} width="fill-parent">
        <Text
          fontSize={13}
          fontWeight={600}
          fill="#1F2937"
          fontFamily="Inter"
        >
          {profile.shortName || profile.name}
        </Text>
        <Text
          fontSize={11}
          fill="#9CA3AF"
          fontFamily="Inter"
        >
          {profile.level} · {profile.orgSize}
        </Text>
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
}: ExpandedCardProps) {
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

      {/* Quote section */}
      <AutoLayout
        width="fill-parent"
      >
        <AutoLayout
          fill="#FFFFFF"
          cornerRadius={10}
          padding={12}
          width="fill-parent"
        >
          <Input
            value={profile.quote ? `"${profile.quote}"` : ''}
            placeholder='"Voeg een quote toe..."'
            onTextEditEnd={(e) => {
              const cleanQuote = e.characters.replace(/^"|"$/g, '').trim()
              onUpdate({ ...profile, quote: cleanQuote })
            }}
            fontSize={13}
            fill="#6B7280"
            fontFamily="Inter"
            width="fill-parent"
            inputBehavior="multiline"
          />
        </AutoLayout>
      </AutoLayout>

      {/* Context tags */}
      <AutoLayout
        width="fill-parent"
      >
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
            fill="#9CA3AF"
            fontFamily="Inter"
            textCase="upper"
            letterSpacing={0.5}
          >
            Context
          </Text>
          <Input
            value={profile.context}
            placeholder="Bijv. Grote instellingen, Zorg, Onderwijs..."
            onTextEditEnd={(e) => onUpdate({ ...profile, context: e.characters })}
            fontSize={12}
            fill="#374151"
            fontFamily="Inter"
            width="fill-parent"
          />
        </AutoLayout>
      </AutoLayout>

      {/* Description */}
      <AutoLayout
        width="fill-parent"
      >
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
            fill="#9CA3AF"
            fontFamily="Inter"
            textCase="upper"
            letterSpacing={0.5}
          >
            Omschrijving
          </Text>
          <Input
            value={profile.description}
            placeholder="Beschrijf dit profiel..."
            onTextEditEnd={(e) => onUpdate({ ...profile, description: e.characters })}
            fontSize={13}
            fill="#374151"
            fontFamily="Inter"
            width="fill-parent"
            inputBehavior="multiline"
          />
        </AutoLayout>
      </AutoLayout>

      {/* Tasks section */}
      <AutoLayout
        width="fill-parent"
      >
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
              fill="#9CA3AF"
              fontFamily="Inter"
              textCase="upper"
              letterSpacing={0.5}
            >
              Kerntaken ({profile.tasks.length})
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
                    fill="#374151"
                    fontFamily="Inter"
                    width="fill-parent"
                  />
                </AutoLayout>
              ))}
            </AutoLayout>
          ) : (
            <Text fontSize={12} fill="#9CA3AF" fontFamily="Inter">
              Nog geen taken toegevoegd
            </Text>
          )}
        </AutoLayout>
      </AutoLayout>

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
            <Text fontSize={11} fill="#EF4444" fontFamily="Inter">
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
        <Text fontSize={10} fill="#9CA3AF" fontFamily="Inter">
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
              <SVG src={PlusIcon} />
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
          padding={12}
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
          <Text fontSize={12} fill="#9CA3AF" fontFamily="Inter">
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
}

function DetailPanel({
  expandedProfile,
  profileNumber,
  category,
  onCollapse,
  onUpdate,
  onDelete,
  onEditCategory,
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
        <Text fontSize={13} fill="#9CA3AF" fontFamily="Inter">
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

  // Property menu
  usePropertyMenu(
    [
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
    figma.ui.onmessage = (msg: { type: string; id?: string; name?: string; icon?: string; color?: string; data?: string; profileId?: string; categoryId?: string; deleteType?: string }) => {
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
          if (data.categories) {
            setCategories(data.categories)
          }
          if (data.profiles) {
            profilesMap.keys().forEach(key => profilesMap.delete(key))
            Object.entries(data.profiles).forEach(([key, profile]) => {
              profilesMap.set(key, profile as Profile)
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
    }
  })

  // Helper: Show category form UI (add or edit)
  function showCategoryFormUI(initialData?: Category) {
    const colorOptions = Object.keys(COLORS).map(c =>
      `<option value="${c}" ${initialData?.colorKey === c ? 'selected' : ''}>${c}</option>`
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
            input, select { width: 100%; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
            input:focus, select:focus { outline: none; border-color: #EC4899; }
            .row { display: flex; gap: 12px; }
            .row > * { flex: 1; }
            button { width: 100%; padding: 12px; background: #EC4899; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
            button:hover { background: #DB2777; }
          </style>
        </head>
        <body>
          <h3>${initialData ? 'Categorie bewerken' : 'Nieuwe categorie'}</h3>
          <input type="hidden" id="id" value="${initialData?.id || ''}">
          <label>Naam</label>
          <input id="name" type="text" placeholder="Bijv. Zorgprofessionals" value="${initialData?.name || ''}">
          <div class="row">
            <div>
              <label>Icon</label>
              <input id="icon" type="text" placeholder="👤" maxlength="2" value="${initialData?.icon || ''}">
            </div>
            <div>
              <label>Kleur</label>
              <select id="color">${colorOptions}</select>
            </div>
          </div>
          <button id="submit">${initialData ? 'Opslaan' : 'Toevoegen'}</button>
          <script>
            document.getElementById('submit').onclick = () => {
              const id = document.getElementById('id').value
              const name = document.getElementById('name').value.trim()
              const icon = document.getElementById('icon').value || '👤'
              const color = document.getElementById('color').value
              
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
        { width: 280, height: 260 }
      )
    })
  }

  // Helper: Show delete confirmation UI
  function showDeleteConfirmationUI(
    type: 'profile' | 'category',
    id: string,
    name: string
  ) {
    const title = type === 'profile' ? 'Profiel verwijderen' : 'Categorie verwijderen'
    const message = type === 'profile' 
      ? `Weet je zeker dat je "${name}" wilt verwijderen?`
      : `Weet je zeker dat je categorie "${name}" wilt verwijderen?`
    
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
        { width: 320, height: 180, title: title }
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
            textarea:focus { outline: none; border-color: #EC4899; }
            button { width: 100%; padding: 12px; background: #EC4899; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
            button:hover { background: #DB2777; }
            .hint { font-size: 11px; color: #9ca3af; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h3>Importeer JSON</h3>
          <p class="hint">Plak hier de geëxporteerde JSON data</p>
          <textarea id="data" placeholder='{"categories": [...], "profiles": {...}}'></textarea>
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
            select:focus { outline: none; border-color: #EC4899; }
            button { width: 100%; padding: 12px; background: #EC4899; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
            button:hover { background: #DB2777; }
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

  // Helper: Export data
  function exportData(sendPayload = false) {
    // Phase 2: Send data when UI is ready
    if (sendPayload) {
      const profiles: Record<string, Profile> = {}
      // Fix: Use Array.from to iterate over the SyncedMap entries iterator
      Array.from(profilesMap.entries()).forEach(([key, profile]) => {
        profiles[key] = profile
      })

      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
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
            button { background: #EC4899; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; margin-top: 8px; }
            button:hover { background: #DB2777; }
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
            textarea:focus { outline: none; border-color: #EC4899; }
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
            <h3>Niet gelukt om te kopiëren</h3>
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
      level: 'Basis',
      orgSize: 'Alle',
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
    if (profiles.length > 0) {
      figma.notify('Kan categorie niet verwijderen: bevat nog profielen', { error: true })
      return
    }

    return showDeleteConfirmationUI('category', category.id, category.name)
  }

  // Helper: Actually delete category (called after confirmation)
  function actualDeleteCategory(category: Category) {
    const newCategories = categories.filter(c => c.id !== category.id)
    setCategories(newCategories)
    figma.notify(`Categorie "${category.name}" verwijderd`)
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
      spacing={8}
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
          <Text fontSize={12} fill="#9CA3AF" fontFamily="Inter">
            {totalProfiles} profiel{totalProfiles !== 1 ? 'en' : ''} · {categories.length} categorie{categories.length !== 1 ? 'ën' : ''}
          </Text>
        </AutoLayout>

        {/* Color legend */}
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
      </AutoLayout>

      {/* Divider removed for tighter layout */}

      {/* Main content area: horizontal layout */}
      <AutoLayout
        direction="horizontal"
        spacing={16}
        width="fill-parent"
      >
        {/* Left panel: Categories with profiles (fixed width) */}
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

          {/* Empty state */}
          {categories.length === 0 && profilesMap.size === 0 && (
            <AutoLayout
              direction="vertical"
              spacing={8}
              padding={32}
              horizontalAlignItems="center"
              width="fill-parent"
            >
              <Text fontSize={14} fill="#9CA3AF" fontFamily="Inter">
                Nog geen categorieën
              </Text>
              <Text fontSize={12} fill="#D1D5DB" fontFamily="Inter">
                Klik op de widget → "Categorie toevoegen"
              </Text>
            </AutoLayout>
          )}
        </AutoLayout>

        {/* Right panel: Detail view (always visible) */}
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
        />
      </AutoLayout>
    </AutoLayout>
  )
}

// Register the widget
register(UserProfilesWidget)