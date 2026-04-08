'use client'

import Image from 'next/image'
import type { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Surface } from '@mianshitong/ui'
import mockInterviewGif from '@/assets/2-mock-interview.gif'

export interface HomeDemoItem {
  title: string
  description: string
}

export interface HomeDemoCarouselProps {
  demos: readonly HomeDemoItem[]
}

const arrowButtonClass =
  'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/88 text-(--mst-color-text-primary) shadow-(--mst-shadow-md) backdrop-blur-sm transition-colors duration-200 hover:border-(--mst-color-primary) hover:text-(--mst-color-primary) md:inline-flex dark:border-white/12 dark:bg-slate-950/72'

export function HomeDemoCarousel({ demos }: HomeDemoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: false,
  })
  const [activeIndex, setActiveIndex] = useState(0)

  const handleSelect = useCallback((api: EmblaCarouselType) => {
    setActiveIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    emblaApi.on('select', handleSelect)
    emblaApi.on('reInit', handleSelect)

    return () => {
      emblaApi.off('select', handleSelect)
      emblaApi.off('reInit', handleSelect)
    }
  }, [emblaApi, handleSelect])

  const showPrevious = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const showNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi]
  )

  if (demos.length === 0) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-5xl md:px-16">
      <button
        aria-label="上一项演示"
        className={`${arrowButtonClass} left-0`}
        onClick={showPrevious}
        type="button"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        aria-label="下一项演示"
        className={`${arrowButtonClass} right-0`}
        onClick={showNext}
        type="button"
      >
        <ChevronRight className="size-5" />
      </button>

      <div
        className="overflow-hidden touch-pan-y select-none"
        onDragStart={(event) => {
          event.preventDefault()
        }}
        ref={emblaRef}
      >
        <div className="flex">
          {demos.map((item, index) => (
            <div
              className="min-w-0 flex-[0_0_100%]"
              key={`${item.title}-${index}`}
            >
              <Surface className="overflow-hidden rounded-lg border-2 shadow-(--mst-shadow-sm) dark:bg-white/4">
                <div className="relative aspect-video overflow-hidden bg-slate-900/4 select-none dark:bg-white/6">
                  <Image
                    alt={`${item.title} 演示预览`}
                    className="pointer-events-none h-full w-full select-none object-cover object-top"
                    draggable={false}
                    placeholder="empty"
                    priority={index === activeIndex}
                    src={mockInterviewGif}
                    unoptimized
                  />
                </div>
                <div className="space-y-2 p-6 text-center">
                  <h3 className="text-2xl font-semibold text-(--mst-color-text-primary)">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-(--mst-color-text-secondary)">
                    {item.description}
                  </p>
                </div>
              </Surface>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {demos.map((item, index) => {
          const isActive = index === activeIndex

          return (
            <button
              aria-label={`切换到${item.title}`}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                isActive
                  ? 'w-8 bg-(--mst-color-primary)'
                  : 'w-2.5 bg-(--mst-color-border-strong)'
              }`}
              key={item.title}
              onClick={() => {
                scrollTo(index)
              }}
              type="button"
            />
          )
        })}
      </div>
    </div>
  )
}
