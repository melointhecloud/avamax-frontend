# @avaluz/ui

Design System compartilhado entre **AvaLuz** e **AvaMax**. Reúne os componentes
primitivos (Shadcn/Radix) usados em toda a plataforma.

## Status — Phase 2 (Bridge incremental)

Neste estágio o pacote **re-exporta** os componentes que hoje vivem em
`src/components/ui`. Isso entrega os _path aliases_ (`@avaluz/ui`) e a estrutura
de workspace **sem quebrar o build**. A migração física dos arquivos para
`packages/ui/` acontecerá de forma gradual nas fases seguintes.

## Uso

```ts
import { Button, Card, Dialog, Input } from "@avaluz/ui";
```

## Componentes exportados

Accordion, AlertDialog, Alert, AspectRatio, Avatar, Badge, BrandedLoader,
Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible,
ComboboxField, Command, ContextMenu, Dialog, Drawer, DropdownMenu, EmptyState,
Form, HoverCard, InputOTP, Input, Label, Menubar, NavigationMenu, Pagination,
Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet,
Sidebar, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toaster,
ToggleGroup, Toggle, Tooltip, useToast.

> O `Toaster`/`toast` do `sonner` são re-exportados como `SonnerToaster` /
> `sonnerToast` para evitar colisão com o toast primitivo (Radix).

## Convenções

- **Não** importe componentes diretamente de `src/components/ui` em código novo —
  use `@avaluz/ui`.
- Componentes devem ser agnósticos de tenant/branding (sem hardcode de marca).
