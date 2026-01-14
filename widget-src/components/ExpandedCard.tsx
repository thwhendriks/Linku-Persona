/**
 * ExpandedCard Component - Detailed profile view
 */

import type { Profile, Category, ColorScheme, WidgetSettings } from '../types'
import { CloseIcon, EditIcon } from '../icons'
import { getFieldLabel } from '../strings'
import type { StringsType } from '../strings'
import { getFieldValue, setFieldValue } from '../utils'
import { DynamicField } from './DynamicField'

const { AutoLayout, Text, Input, SVG } = figma.widget

export interface ExpandedCardProps {
  profile: Profile
  number: number
  category: Category | null
  colors: ColorScheme
  onCollapse: () => void
  onUpdate: (profile: Profile) => void
  onDelete: () => void
  onEditCategory: () => void
  widgetSettings: WidgetSettings
  strings: StringsType
}

export function ExpandedCard({
  profile,
  number,
  category,
  colors,
  onCollapse,
  onUpdate,
  onDelete,
  onEditCategory,
  widgetSettings,
  strings,
}: ExpandedCardProps) {
  // Sort fields by order, filter visible
  const visibleFields = widgetSettings.fields
    .filter(f => f.isVisible)
    .sort((a, b) => a.order - b.order)

  // Helper to render tasks field
  const renderTasksField = (fieldConfig: typeof visibleFields[0]) => (
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
            {getFieldLabel(fieldConfig, strings)} ({profile.tasks.length})
          </Text>
          <AutoLayout width="fill-parent" height={1} />
          <AutoLayout
            padding={{ horizontal: 8, vertical: 4 }}
            cornerRadius={6}
            fill={colors.bgLight}
            onClick={() => {
              onUpdate({ ...profile, tasks: [...profile.tasks, strings.newTask] })
            }}
            hoverStyle={{ fill: colors.border }}
          >
            <Text fontSize={11} fill={colors.text} fontFamily="Inter">{strings.addTask}</Text>
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
                  placeholder={strings.taskPlaceholder}
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
            {strings.noTasks}
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
            tooltip={strings.changeCategoryTooltip}
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
              {category?.name || strings.noCategory}
            </Text>
            <SVG src={EditIcon} />
          </AutoLayout>
          <Input
            value={profile.name}
            placeholder={strings.profileNamePlaceholder}
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
            strings={strings}
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
              {strings.deleteProfile}
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}
