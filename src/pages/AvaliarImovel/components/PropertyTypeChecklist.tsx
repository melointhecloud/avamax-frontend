import { useEffect } from 'react'
import { Control, useWatch, useFormContext } from 'react-hook-form'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChecklistItem } from './ChecklistItem'
import { getConfigByType, buildDefaultEspecificacoes } from '../config/propertyTypeChecklistConfig'
import { CATEGORIA_TO_PROPERTY_TYPE, type PropertyType } from '../types/specifications'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'

interface PropertyTypeChecklistProps {
  control: Control<AvaliarImovelFormData>
}

export const PropertyTypeChecklist = ({ control }: PropertyTypeChecklistProps) => {
  const isMobile = useIsMobile()
  const { setValue, getValues } = useFormContext<AvaliarImovelFormData>()
  
  const categoria = useWatch({ control, name: 'categoria' })
  const propertyType = categoria ? CATEGORIA_TO_PROPERTY_TYPE[categoria] : undefined
  
  const config = propertyType ? getConfigByType(propertyType) : undefined

  // Initialize especificacoes when property type changes
  useEffect(() => {
    if (propertyType) {
      const currentEspecificacoes = getValues('especificacoes')
      
      // Only initialize if type changed or not set
      if (!currentEspecificacoes || currentEspecificacoes.tipo !== propertyType) {
        const defaults = buildDefaultEspecificacoes(propertyType)
        if (defaults) {
          setValue('especificacoes', defaults, { shouldValidate: true })
        }
      }
    }
  }, [propertyType, setValue, getValues])

  if (!config || !propertyType) {
    return null
  }

  const defaultOpenGroups = isMobile ? [] : config.groups.map((g) => g.id)

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Especificações - {config.label}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Marque as características que se aplicam ao imóvel
        </p>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={defaultOpenGroups}
          className="w-full"
        >
          {config.groups.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {group.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {group.items.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      control={control}
                      itemId={item.id}
                      label={item.label}
                      detailField={item.detailField}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
