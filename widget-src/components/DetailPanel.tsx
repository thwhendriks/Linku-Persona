/**
 * DetailPanel Component - Right side detail view container
 */

import type { Profile, Category, WidgetSettings } from '../types'
import { COLORS } from '../constants'
import { STRINGS } from '../strings'
import { ExpandedCard } from './ExpandedCard'

const { AutoLayout, Text } = figma.widget

export interface DetailPanelProps {
  expandedProfile: Profile | null
  profileNumber: number
  category: Category | null
  onCollapse: () => void
  onUpdate: (profile: Profile) => void
  onDelete: () => void
  onEditCategory: () => void
  widgetSettings: WidgetSettings
}

export function DetailPanel({
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
          {STRINGS.detailPanelEmpty}
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
