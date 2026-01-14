/**
 * CategorySection Component - Category container with profile cards
 */

import type { Profile, Category, ColorScheme } from '../types'
import { COLORS } from '../constants'
import { getPlusIcon, EditIcon, TrashIcon } from '../icons'
import type { StringsType } from '../strings'
import { MiniCard } from './MiniCard'

const { AutoLayout, Text, SVG } = figma.widget

// Interface for SyncedMap-like object
interface ProfilesMap {
  values(): Iterable<Profile>
}

export interface CategorySectionProps {
  category: Category
  profiles: Profile[]
  allProfiles: ProfilesMap
  expandedId: string | null
  onExpand: (id: string | null) => void
  onUpdateProfile: (profile: Profile) => void
  onDeleteProfile: (id: string) => void
  onAddProfile: () => void
  onEditCategory: () => void | Promise<void>
  onDeleteCategory: () => void
  strings: StringsType
}

export function CategorySection({
  category,
  profiles,
  allProfiles,
  expandedId,
  onExpand,
  onUpdateProfile: _onUpdateProfile,
  onDeleteProfile: _onDeleteProfile,
  onAddProfile,
  onEditCategory,
  onDeleteCategory,
  strings,
}: CategorySectionProps) {
  const colors: ColorScheme = COLORS[category.colorKey] || COLORS.pink

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
                  tooltip={strings.categoryEdit}
                >
                  <SVG src={EditIcon} />
                </AutoLayout>
                <AutoLayout
                  padding={6}
                  cornerRadius={6}
                  onClick={onDeleteCategory}
                  hoverStyle={{ fill: '#FEE2E2' }}
                  tooltip={strings.categoryDelete}
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
              tooltip={strings.newProfileTooltip}
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
          padding={{ top: 12, bottom: 20, left: 12, right: 12 }}
          horizontalAlignItems="center"
          width="fill-parent"
        >
          <Text fontSize={12} fill="#6B7280" fontFamily="Inter">
            {strings.noProfilesInCategory}
          </Text>
        </AutoLayout>
      )}
    </AutoLayout>
  )
}
