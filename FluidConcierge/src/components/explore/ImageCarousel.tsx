import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  className?: string;
  onImageClick?: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = "h-48 sm:h-56", onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  if (!images || images.length === 0) {
    return (
      <div className={`${className} bg-slate-100 flex items-center justify-center rounded-xl`}>
        <span className="material-symbols-outlined text-slate-300 text-4xl">image_not_supported</span>
      </div>
    );
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick?.(currentIndex);
  };

  return (
    <div className={`relative overflow-hidden group/carousel ${className}`}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          src={images[currentIndex].startsWith('http') ? images[currentIndex] : `http://localhost:8081${images[currentIndex]}`}
          alt={`Slide ${currentIndex}`}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          onClick={handleImageClick}
        />
      </AnimatePresence>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-20"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Lightbox Trigger */}
      <button 
        className="absolute top-2 right-2 p-1.5 bg-black/30 backdrop-blur-md rounded-lg text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
        onClick={handleImageClick}
      >
        <Maximize2 size={14} />
      </button>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-emerald-400 w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter (e.g. 1/5) */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/20 backdrop-blur-md rounded-md text-[10px] text-white font-bold z-20">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
