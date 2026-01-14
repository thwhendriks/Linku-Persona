/**
 * EmptyState Component - Zero-state when no profiles exist
 */

import { LinkuLogo } from '../icons'
import { STRINGS } from '../strings'

const { AutoLayout, Text, SVG } = figma.widget

export interface EmptyStateProps {
  onAddProfile: () => void
}

export function EmptyState({ onAddProfile }: EmptyStateProps) {
  return (
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
          {STRINGS.emptyTitle}
        </Text>

        {/* Subtitle */}
        <Text 
          fontSize={14} 
          fill="#6B7280" 
          fontFamily="Inter"
          horizontalAlignText="center"
        >
          {STRINGS.emptySubtitle}
        </Text>

        {/* Primary CTA Button */}
        <AutoLayout
          fill="#2D6BFB"
          cornerRadius={8}
          padding={{ horizontal: 20, vertical: 12 }}
          onClick={onAddProfile}
          hoverStyle={{ fill: '#1E5BD9' }}
        >
          <Text 
            fontSize={14} 
            fontWeight={600} 
            fill="#FFFFFF" 
            fontFamily="Inter"
          >
            {STRINGS.emptyAddFirst}
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
            {STRINGS.emptyTip}
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
            {STRINGS.brandingPrefix}
          </Text>
          <SVG src={LinkuLogo} />
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}
