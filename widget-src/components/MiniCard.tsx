/**
 * MiniCard Component - Collapsed profile card view
 */

import type { ColorScheme, Profile } from '../types'

const { AutoLayout, Text } = figma.widget

export interface MiniCardProps {
  profile: Profile
  number: number
  colors: ColorScheme
  onExpand: () => void
  isSelected?: boolean
}

export function MiniCard({ profile, number, colors, onExpand, isSelected = false }: MiniCardProps) {
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
