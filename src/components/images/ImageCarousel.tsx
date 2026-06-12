import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

type ImageCarouselProps = {
  urls: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  showCounter?: boolean;
};

export function ImageCarousel({
  urls,
  alt,
  className,
  imageClassName,
  showCounter = true,
}: ImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [current, setCurrent] = React.useState(1);
  const [failed, setFailed] = React.useState<Record<number, boolean>>({});

  const total = urls.length;
  const hasMultiple = total > 1;

  React.useEffect(() => {
    if (!api) return;

    const update = () => setCurrent(api.selectedScrollSnap() + 1);
    update();
    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  if (total === 0) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50", className)}>
        <ImageOff className="h-16 w-16 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Carousel
        setApi={(nextApi) => setApi(nextApi)}
        opts={{ loop: hasMultiple, duration: 20 }}
        className="h-full w-full overflow-hidden"
      >
        <CarouselContent className="h-full ml-0">
          {urls.map((url, idx) => (
            <CarouselItem key={`${url}-${idx}`} className="h-full pl-0">
              {failed[idx] ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <ImageOff className="h-16 w-16 text-muted-foreground/40" />
                </div>
              ) : (
                <img
                  src={url}
                  alt={alt}
                  className={cn("h-full w-full object-cover", imageClassName)}
                  loading="lazy"
                  onError={() => setFailed((prev) => ({ ...prev, [idx]: true }))}
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {hasMultiple && (
          <>
            <CarouselPrevious
              variant="secondary"
              className="left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            />
            <CarouselNext
              variant="secondary"
              className="right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            />

            {showCounter && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium shadow-md">
                {current} / {total}
              </div>
            )}
          </>
        )}
      </Carousel>
    </div>
  );
}
