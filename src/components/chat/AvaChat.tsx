import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = "https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/avachat";

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Olá! Sou o CHATAVA, seu consultor imobiliário. Posso te ajudar com precificação de imóveis, estratégias de captação, uso da plataforma AvaLuz e muito mais. Como posso te ajudar hoje?",
};

const ALLOWED_PREFIXES = [
  "/home", "/avaliar", "/avaliacao", "/buscar-imoveis", "/historico",
  "/creditos", "/assinatura", "/conquistas", "/configuracoes",
  "/ajuda", "/tutorial", "/tutorial-avaluz", "/noticiario", "/rede",
  "/payment-success", "/time",
  "/home", "/avaliar", "/historico", "/avaliacao",
  "/creditos", "/configuracoes", "/noticiario",
  "/rede", "/conquistas", "/assinatura", "/ajuda",
];

type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const BUTTON_SIZE = 56; // px (h-14 w-14)
const MARGIN = 24; // px gap from edges

function getCornerStyle(corner: Corner): React.CSSProperties {
  const base: React.CSSProperties = { position: "fixed", zIndex: 50 };
  switch (corner) {
    case "bottom-right": return { ...base, bottom: MARGIN, right: MARGIN };
    case "bottom-left":  return { ...base, bottom: MARGIN, left: MARGIN };
    case "top-right":    return { ...base, top: MARGIN, right: MARGIN };
    case "top-left":     return { ...base, top: MARGIN, left: MARGIN };
  }
}

function snapToCorner(x: number, y: number): Corner {
  const midX = window.innerWidth / 2;
  const midY = window.innerHeight / 2;
  const isRight = x + BUTTON_SIZE / 2 > midX;
  const isBottom = y + BUTTON_SIZE / 2 > midY;
  if (isRight && isBottom)  return "bottom-right";
  if (!isRight && isBottom) return "bottom-left";
  if (isRight && !isBottom) return "top-right";
  return "top-left";
}

export const AvaChat = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Draggable state ---
  const [corner, setCorner] = useState<Corner>(() => {
    try {
      return (localStorage.getItem("avachat-corner") as Corner) || "bottom-right";
    } catch {
      return "bottom-right";
    }
  });
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragOrigin = useRef<{ mouseX: number; mouseY: number; btnX: number; btnY: number } | null>(null);
  const hasDragged = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Save corner preference
  useEffect(() => {
    try { localStorage.setItem("avachat-corner", corner); } catch { /* ignore */ }
  }, [corner]);

  // Global mouse-move / mouse-up while dragging
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      if (!dragOrigin.current) return;
      const dx = e.clientX - dragOrigin.current.mouseX;
      const dy = e.clientY - dragOrigin.current.mouseY;
      if (!hasDragged.current && Math.abs(dx) + Math.abs(dy) > 4) {
        hasDragged.current = true;
      }
      const x = Math.max(0, Math.min(window.innerWidth  - BUTTON_SIZE, dragOrigin.current.btnX + dx));
      const y = Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE, dragOrigin.current.btnY + dy));
      setDragPos({ x, y });
    };

    const onUp = (e: MouseEvent) => {
      if (dragOrigin.current && hasDragged.current) {
        const dx = e.clientX - dragOrigin.current.mouseX;
        const dy = e.clientY - dragOrigin.current.mouseY;
        const x = Math.max(0, Math.min(window.innerWidth  - BUTTON_SIZE, dragOrigin.current.btnX + dx));
        const y = Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE, dragOrigin.current.btnY + dy));
        setCorner(snapToCorner(x, y));
      }
      setDragging(false);
      setDragPos(null);
      dragOrigin.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // Touch support
  useEffect(() => {
    if (!dragging) return;

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!dragOrigin.current) return;
      const dx = touch.clientX - dragOrigin.current.mouseX;
      const dy = touch.clientY - dragOrigin.current.mouseY;
      if (!hasDragged.current && Math.abs(dx) + Math.abs(dy) > 4) {
        hasDragged.current = true;
      }
      const x = Math.max(0, Math.min(window.innerWidth  - BUTTON_SIZE, dragOrigin.current.btnX + dx));
      const y = Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE, dragOrigin.current.btnY + dy));
      setDragPos({ x, y });
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (dragOrigin.current && hasDragged.current) {
        const dx = touch.clientX - dragOrigin.current.mouseX;
        const dy = touch.clientY - dragOrigin.current.mouseY;
        const x = Math.max(0, Math.min(window.innerWidth  - BUTTON_SIZE, dragOrigin.current.btnX + dx));
        const y = Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE, dragOrigin.current.btnY + dy));
        setCorner(snapToCorner(x, y));
      }
      setDragging(false);
      setDragPos(null);
      dragOrigin.current = null;
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging]);

  if (!ALLOWED_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))) {
    return null;
  }

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkdmlreWVldGhiaXJyZGNhd2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODQwMjMsImV4cCI6MjA3ODE2MDAyM30.8fls1V5GH0Ubh_7CLeCiygXPGObHR4wCQgFmFMoSV8I`,
        },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m !== WELCOME_MESSAGE), userMsg],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Muitas mensagens. Aguarde alguns segundos.");
        } else if (response.status === 401 || response.status === 403) {
          toast.error("Erro de autenticação. Contate o suporte.");
        } else {
          toast.error(errorData.error || "Erro no servidor. Tente novamente.");
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        toast.error("Falha na conexão. Verifique sua internet.");
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Falha na conexão. Verifique sua internet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    hasDragged.current = false;
    dragOrigin.current = { mouseX: e.clientX, mouseY: e.clientY, btnX: rect.left, btnY: rect.top };
    setDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    hasDragged.current = false;
    dragOrigin.current = { mouseX: touch.clientX, mouseY: touch.clientY, btnX: rect.left, btnY: rect.top };
    setDragging(true);
  };

  const handleClick = () => {
    if (!hasDragged.current) {
      setOpen(true);
    }
  };

  // Compute button style
  const buttonStyle: React.CSSProperties =
    dragging && dragPos
      ? { position: "fixed", zIndex: 50, left: dragPos.x, top: dragPos.y }
      : getCornerStyle(corner);

  return (
    <>
      {/* Floating Draggable Button */}
      <button
        ref={btnRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        style={buttonStyle}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg select-none",
          dragging ? "cursor-grabbing scale-105 shadow-2xl" : "cursor-grab hover:scale-105 hover:shadow-xl",
          !dragging && "transition-all duration-300"
        )}
        aria-label="Abrir CHATAVA"
      >
        <Bot className="h-6 w-6 pointer-events-none" />
      </button>

      {/* Chat Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <SheetTitle className="text-left">CHATAVA</SheetTitle>
                  <p className="text-xs text-muted-foreground">Seu consultor imobiliário</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="flex flex-col">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 p-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Digitando...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
