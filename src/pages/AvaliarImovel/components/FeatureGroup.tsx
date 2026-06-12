import { useMemo, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { FeatureCheckboxItem } from "./FeatureCheckboxItem";
import type { FeatureItem, FeatureGroupKey } from "@/features/avaliar/propertyFeaturesConfig";

interface FeatureGroupProps {
  groupKey: FeatureGroupKey;
  title: string;
  items: FeatureItem[];
  selectedSlugs: string[];
  onToggle: (groupKey: FeatureGroupKey, slug: string, checked: boolean) => void;
  globalSearch: string;
}

export function FeatureGroup({
  groupKey,
  title,
  items,
  selectedSlugs,
  onToggle,
  globalSearch,
}: FeatureGroupProps) {
  const [localSearch, setLocalSearch] = useState("");

  const filteredItems = useMemo(() => {
    const searchTerm = (globalSearch || localSearch).toLowerCase().trim();
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm)
    );
  }, [items, globalSearch, localSearch]);

  const selectedCount = useMemo(
    () => items.filter((item) => selectedSlugs.includes(item.slug)).length,
    [items, selectedSlugs]
  );

  const handleToggle = useCallback(
    (slug: string, checked: boolean) => {
      onToggle(groupKey, slug, checked);
    },
    [groupKey, onToggle]
  );

  return (
    <div className="space-y-3">
      {selectedCount > 0 && (
        <div className="flex justify-end">
          <Badge variant="secondary" className="text-xs">
            {selectedCount} selecionadas
          </Badge>
        </div>
      )}

      {!globalSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      )}

      <ScrollArea className="h-48 pr-3">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum item encontrado
          </p>
        ) : (
          <div className="space-y-0.5">
            {filteredItems.map((item) => (
              <FeatureCheckboxItem
                key={item.slug}
                slug={item.slug}
                label={item.label}
                checked={selectedSlugs.includes(item.slug)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
