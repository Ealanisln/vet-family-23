"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  images: Array<{
    src: string;
    width: number;
    height: number;
  }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer = ({ images, initialIndex = 0, isOpen, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          navigate(-1);
          break;
        case "ArrowRight":
          navigate(1);
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const navigate = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
      setScale(1);
    }
  };

  const handleZoom = (factor: number) => {
    const newScale = scale * factor;
    if (newScale >= 0.5 && newScale <= 3) {
      setScale(newScale);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        onClick={() => {
          if (!isDragging) onClose();
        }}
      >
        {/* Controls */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoom(1.2);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ZoomIn className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoom(0.8);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ZoomOut className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(1);
            }}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Image */}
        <motion.div
          className="relative overflow-hidden"
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            key={currentIndex}
            src={images[currentIndex].src}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: scale,
              transition: { duration: 0.3 }
            }}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            draggable="false"
          />
        </motion.div>

        {/* Image counter */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full">
          <p className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;