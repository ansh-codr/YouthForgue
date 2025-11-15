'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProjectMedia } from '@/src/types/media';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  media: ProjectMedia[];
}

export function ImageGallery({ media }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeMedia = media[activeIndex];

  if (!media.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-muted-foreground">
        No media yet
      </div>
    );
  }

  const goPrev = () => setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  const goNext = () => setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-4">
      <div className="relative h-80 md:h-[420px] w-full overflow-hidden rounded-3xl">
        {activeMedia && (
          <button type="button" className="w-full h-full" onClick={() => setLightboxOpen(true)}>
            <Image
              src={activeMedia.downloadUrl}
              alt={activeMedia.alt || 'Project media'}
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          </button>
        )}
        {media.length > 1 && (
          <div className="absolute inset-y-0 left-0 flex flex-col justify-between p-4">
            <button
              type="button"
              onClick={goPrev}
              className="glass-button-ghost rounded-full p-2"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="glass-button-ghost rounded-full p-2"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {media.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'relative h-20 rounded-2xl overflow-hidden border border-transparent',
              activeIndex === index ? 'border-accent' : 'border-white/5'
            )}
          >
            <Image src={item.downloadUrl} alt={item.alt || 'Preview'} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxOpen && activeMedia && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex h-full items-center justify-center px-6">
              <div className="relative w-full max-w-5xl aspect-video">
                <Image
                  src={activeMedia.downloadUrl}
                  alt={activeMedia.alt || 'Project media'}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
