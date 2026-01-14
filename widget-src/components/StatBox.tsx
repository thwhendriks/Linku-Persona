/**
 * StatBox Component - Statistics display box
 */

import type { ColorScheme } from '../types'
import { EditIcon } from '../icons'

const { AutoLayout, Text, SVG } = figma.widget

export interface StatBoxProps {
  label: string
  value: string
  colors: ColorScheme
  editable?: boolean
  onEdit?: () => void
}

export function StatBox({ label, value, colors, editable = false, onEdit }: StatBoxProps) {
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
