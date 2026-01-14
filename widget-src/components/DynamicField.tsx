/**
 * DynamicField Component - Configurable field renderer
 */

import type { FieldConfig } from '../types'

const { AutoLayout, Text, Input } = figma.widget

export interface DynamicFieldProps {
  config: FieldConfig
  value: string
  onChange: (value: string) => void
}

export function DynamicField({ config, value, onChange }: DynamicFieldProps) {
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
