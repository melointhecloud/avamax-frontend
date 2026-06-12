/**
 * @avaluz/lib — Hooks e utilitários transversais (AvaLuz + AvaMax)
 *
 * Bridge incremental (Phase 2): re-exporta utilitários, hooks e validadores Zod
 * que hoje vivem em `src/lib`, `src/hooks` e `src/validators`. A migração física
 * acontece gradualmente nas próximas fases, sem quebrar o build.
 *
 * Uso: `import { cn, useToast, translateAuthError } from "@avaluz/lib";`
 */

// Utilities
export { cn } from "../../src/lib/utils";
export { translateAuthError } from "../../src/lib/error-messages";

// Hooks transversais
export { useToast, toast } from "../../src/hooks/use-toast";
export { useIsMobile } from "../../src/hooks/use-mobile";

// Validadores Zod (schemas + tipos inferidos)
export * from "../../src/validators/SignIn";
export * from "../../src/validators/SignUp";
export * from "../../src/validators/AvaliarImovel";
export * from "../../src/validators/BuscarImoveis";
export * from "../../src/validators/profile";
