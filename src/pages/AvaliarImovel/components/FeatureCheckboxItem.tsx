import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FeatureCheckboxItemProps {
  slug: string;
  label: string;
  checked: boolean;
  onToggle: (slug: string, checked: boolean) => void;
}

export const FeatureCheckboxItem = memo(function FeatureCheckboxItem({
  slug,
  label,
  checked,
  onToggle,
}: FeatureCheckboxItemProps) {
  return (
    <div className="flex items-center space-x-2 py-1.5">
      <Checkbox
        id={slug}
        checked={checked}
        onCheckedChange={(checked) => onToggle(slug, !!checked)}
      />
      <Label
        htmlFor={slug}
        className="text-sm font-normal cursor-pointer leading-tight"
      >
        {label}
      </Label>
    </div>
  );
});
