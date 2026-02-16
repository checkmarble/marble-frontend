import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { useEffect, useState } from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CarouselApi = UseEmblaCarouselType[1];

export const ClientTimeline = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, slidesToScroll: 'auto' });
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const onSelect = (api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanGoPrev(api.canScrollPrev());
    setCanGoNext(api.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect(emblaApi);
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="flex gap-v2-sm">
      <Button
        variant="secondary"
        size="default"
        mode="icon"
        disabled={!canGoPrev}
        onClick={() => emblaApi?.scrollPrev()}
      >
        <Icon icon="arrow-left" className="size-5" />
      </Button>
      <div ref={emblaRef} className="grow overflow-hidden">
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div className="h-[30px] w-50 shrink-0 bg-blue-58 even:bg-green-primary" key={idx}></div>
          ))}
        </div>
      </div>
      <Button
        variant="secondary"
        size="default"
        mode="icon"
        disabled={!canGoNext}
        onClick={() => emblaApi?.scrollNext()}
      >
        <Icon icon="arrow-right" className="size-5" />
      </Button>
    </div>
  );
};
