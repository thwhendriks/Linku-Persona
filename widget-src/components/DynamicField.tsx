/**
 * DynamicField Component - Configurable field renderer
 */

import type { FieldConfig } from '../types'
import { getFieldLabel } from '../strings'
import type { StringsType } from '../strings'

const { AutoLayout, Text, Input } = figma.widget

export interface DynamicFieldProps {
  config: FieldConfig
  value: string
  onChange: (value: string) => void
  strings: StringsType
}

export function DynamicField({ config, value, onChange, strings }: DynamicFieldProps) {
  const label = getFieldLabel(config, strings)
  
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
          {label}
        </Text>
        <Input
          value={value}
          placeholder={`${label}...`}
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
