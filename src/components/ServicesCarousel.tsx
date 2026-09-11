import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ServiceCard {
  number: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface ServicesCarouselProps {
  services: ServiceCard[];
}

const AUTOPLAY_INTERVAL_MS = 4500;

export default function ServicesCarousel({ services }: ServicesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(services.length - 1, index));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    let nearest = 0;
    let minDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  };

  useEffect(() => {
    if (isPaused || services.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      const next = (activeIndexRef.current + 1) % services.length;
      scrollToIndex(next);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, services.length]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsPaused(false);
      }}
    >
      {/* Carousel Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Services carousel"
      >
        {services.map((service, index) => (
          <div
            key={index}
            className="service-card flex-shrink-0 w-full snap-start bg-card rounded-3xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative h-64 md:h-96 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  width={1200}
                  height={900}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-forest/90 text-lime px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                  {service.number}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-forest text-lime px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href="/index#get-free-estimate"
                  className="inline-flex items-center gap-2 bg-lime hover:bg-lime-dark text-forest font-bold px-6 py-3 rounded-lg transition-all duration-200 hover:gap-3 group w-fit"
                >
                  Request This Service
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-8">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {services.map((service, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to ${service.title}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-8 bg-forest' : 'w-2.5 bg-forest/25 hover:bg-forest/50'
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous service"
            className="w-12 h-12 rounded-full bg-forest text-lime flex items-center justify-center transition-all duration-200 hover:bg-forest-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === services.length - 1}
            aria-label="Next service"
            className="w-12 h-12 rounded-full bg-forest text-lime flex items-center justify-center transition-all duration-200 hover:bg-forest-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
