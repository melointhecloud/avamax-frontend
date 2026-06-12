import { useMemo, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormSection } from "./FormSection";
import { FeatureGroup } from "./FeatureGroup";
import {
  PROPERTY_FEATURES_CONFIG,
  type FeatureGroupKey,
} from "@/features/avaliar/propertyFeaturesConfig";
import type { AvaliarImovelFormData } from "@/validators/AvaliarImovel";

type FeaturesData = {
  byGroup: Partial<Record<FeatureGroupKey, string[]>>;
  selected: string[];
};

export function PropertyFeaturesSection() {
  const { watch, setValue } = useFormContext<AvaliarImovelFormData>();
  const isMobile = useIsMobile();
  const [globalSearch, setGlobalSearch] = useState("");

  const features = watch("features") as FeaturesData | undefined;
  const byGroup = features?.byGroup ?? {};

  const totalSelected = useMemo(() => {
    return Object.values(byGroup).reduce(
      (acc, slugs) => acc + (slugs?.length ?? 0),
      0
    );
  }, [byGroup]);

  const handleToggle = useCallback(
    (groupKey: FeatureGroupKey, slug: string, checked: boolean) => {
      const currentGroup = byGroup[groupKey] ?? [];
      let newGroup: string[];

      if (checked) {
        newGroup = [...currentGroup, slug];
      } else {
        newGroup = currentGroup.filter((s) => s !== slug);
      }

      const newByGroup = { ...byGroup, [groupKey]: newGroup };

      // Sync selected array
      const allSelected = Object.values(newByGroup).flat();
      const uniqueSelected = [...new Set(allSelected)];

      setValue("features", {
        byGroup: newByGroup,
        selected: uniqueSelected,
      });
    },
    [byGroup, setValue]
  );

  const handleClearAll = useCallback(() => {
    setValue("features", {
      byGroup: {},
      selected: [],
    });
    setGlobalSearch("");
  }, [setValue]);

  const getGroupSelectedSlugs = useCallback(
    (groupKey: FeatureGroupKey): string[] => {
      return byGroup[groupKey] ?? [];
    },
    [byGroup]
  );

  // Filter groups that have matching items when global search is active
  const visibleGroups = useMemo(() => {
    if (!globalSearch.trim()) return PROPERTY_FEATURES_CONFIG;

    const searchTerm = globalSearch.toLowerCase().trim();
    return PROPERTY_FEATURES_CONFIG.filter((group) =>
      group.items.some((item) =>
        item.label.toLowerCase().includes(searchTerm)
      )
    );
  }, [globalSearch]);

  return (
    <FormSection title="Características do Imóvel">
      {/* Global Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar em todas as características..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          {totalSelected > 0 && (
            <Badge variant="default" className="text-sm">
              {totalSelected} selecionadas
            </Badge>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={totalSelected === 0}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Limpar tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todas as seleções?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá todas as {totalSelected} características
                  selecionadas. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Mobile: Accordion */}
      {isMobile ? (
        <Accordion type="multiple" className="w-full space-y-2">
          {visibleGroups.map((group) => {
            const selectedCount = getGroupSelectedSlugs(group.key).length;
            return (
              <AccordionItem
                key={group.key}
                value={group.key}
                className="border rounded-lg px-3"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{group.title}</span>
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCount}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <FeatureGroup
                    groupKey={group.key}
                    title={group.title}
                    items={group.items}
                    selectedSlugs={getGroupSelectedSlugs(group.key)}
                    onToggle={handleToggle}
                    globalSearch={globalSearch}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        /* Desktop: Grid of Cards */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleGroups.map((group) => {
            const selectedCount = getGroupSelectedSlugs(group.key).length;
            return (
              <Card key={group.key} className="overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {group.title}
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCount}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <FeatureGroup
                    groupKey={group.key}
                    title={group.title}
                    items={group.items}
                    selectedSlugs={getGroupSelectedSlugs(group.key)}
                    onToggle={handleToggle}
                    globalSearch={globalSearch}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {visibleGroups.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma característica encontrada para "{globalSearch}"
        </p>
      )}
    </FormSection>
  );
}
