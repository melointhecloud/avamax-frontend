import { Control, Controller, useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'
import type { ChecklistItemConfig } from '../types/specifications'

interface ChecklistItemProps {
  control: Control<AvaliarImovelFormData>
  itemId: string
  label: string
  detailField?: ChecklistItemConfig['detailField']
}

export const ChecklistItem = ({
  control,
  itemId,
  label,
  detailField,
}: ChecklistItemProps) => {
  const isChecked = useWatch({
    control,
    name: `especificacoes.checklist.${itemId}` as any,
  })

  return (
    <div className="space-y-2">
      <Controller
        control={control}
        name={`especificacoes.checklist.${itemId}` as any}
        defaultValue={false}
        render={({ field }) => (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={itemId}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
            <Label
              htmlFor={itemId}
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              {label}
            </Label>
          </div>
        )}
      />

      {detailField && isChecked && (
        <div className="ml-7 animate-in slide-in-from-top-2 duration-200">
          <Controller
            control={control}
            name={`especificacoes.detalhes.${detailField.id}` as any}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Label htmlFor={detailField.id} className="text-xs text-muted-foreground">
                  {detailField.label}
                </Label>
                <Input
                  id={detailField.id}
                  type={detailField.type}
                  placeholder={detailField.placeholder}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = detailField.type === 'number' 
                      ? (e.target.value ? Number(e.target.value) : null)
                      : e.target.value
                    field.onChange(value)
                  }}
                  className="h-9"
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
