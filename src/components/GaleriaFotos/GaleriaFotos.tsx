"use client";

import { useEffect, useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Filter, Grid3X3, LayoutGrid, Search, Image as ImageIcon, X } from "lucide-react";
import { getCloudinaryPhotos } from "../../app/actions/get-photos";

type CloudinaryPhoto = {
  src: string;
  width: number;
  height: number;
  tags: string[];
  srcSet: {
    src: string;
    width: number;
    height: number;
  }[];
};

const DEFAULT_TAG = "Instalaciones";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

export default function GaleriaFotos() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState<CloudinaryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<CloudinaryPhoto[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([DEFAULT_TAG]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry');

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const photos = await getCloudinaryPhotos();
        setCloudinaryPhotos(photos);
        const tags = Array.from(new Set(photos.flatMap(photo => photo.tags)));
        setAllTags(tags.sort());
        const initialFiltered = photos.filter(photo => photo.tags.includes(DEFAULT_TAG));
        setFilteredPhotos(initialFiltered);
      } catch (error) {
        console.error("Error fetching photos:", error);
        setError("No se pudieron cargar las fotos. Por favor, intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    let filtered = cloudinaryPhotos;

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(photo =>
        selectedTags.some(tag => photo.tags.includes(tag))
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredPhotos(filtered);
  }, [selectedTags, cloudinaryPhotos, searchTerm]);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedTags.length > 0 || searchTerm.length > 0;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <motion.div 
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar las fotos
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <Camera className="w-16 h-16 mb-6 mx-auto text-blue-500" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando galería
          </h3>
          <p className="text-gray-600">Preparando tus fotos favoritas...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-blue-50 rounded-full"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Camera className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Galería de Fotos</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
              Nuestras Instalaciones
            </span>
          </h1>
          
          <p className="text-gray-600 text-lg font-normal max-w-3xl mx-auto leading-relaxed">
            Explora nuestra galería de fotos dedicada a nuestras queridas mascotas y
            los servicios de atención veterinaria que ofrecemos. Desde adorables
            cachorros hasta felices gatitos, nuestras imágenes capturan momentos
            especiales en la vida de tus compañeros peludos.
          </p>
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'masonry'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isFilterOpen || hasActiveFilters
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                    {selectedTags.length + (searchTerm ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filtrar por categoría</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {allTags.map((tag) => (
                      <motion.button
                        key={tag}
                        variants={itemVariants}
                        onClick={() => handleTagClick(tag)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          px-4 py-2 rounded-full transition-all duration-300 ease-out font-medium text-sm
                          ${selectedTags.includes(tag)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200'}
                        `}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2 inline-block w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Photos Count */}
        {filteredPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-blue-600">{filteredPhotos.length}</span> 
              {filteredPhotos.length === 1 ? ' foto' : ' fotos'}
              {hasActiveFilters && (
                <span className="text-gray-500"> (filtradas)</span>
              )}
            </p>
          </motion.div>
        )}

        {/* Photo Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          {filteredPhotos.length > 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <PhotoAlbum
                photos={filteredPhotos}
                layout={viewMode === 'masonry' ? 'masonry' : 'rows'}
                targetRowHeight={viewMode === 'grid' ? 300 : 250}
                onClick={({ index }) => {
                  setLightboxIndex(index);
                }}
                columns={(containerWidth) => {
                  if (containerWidth < 640) return 2;
                  if (containerWidth < 800) return viewMode === 'grid' ? 2 : 2;
                  if (containerWidth < 1200) return viewMode === 'grid' ? 3 : 3;
                  return viewMode === 'grid' ? 4 : 4;
                }}
                spacing={(containerWidth) => {
                  return containerWidth < 640 ? 8 : 12;
                }}
                                 renderPhoto={({ imageProps }) => (
                   <motion.div
                     whileHover={{ scale: 1.02 }}
                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
                     className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                   >
                     <img
                       {...imageProps}
                       alt=""
                       className="transition-transform duration-300 group-hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                   </motion.div>
                 )}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
            >
              <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron fotos
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? "Intenta ajustar tus filtros de búsqueda" 
                  : "No hay fotos disponibles en este momento"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Lightbox */}
        {lightboxIndex >= 0 && (
          <Lightbox
            slides={filteredPhotos}
            open={true}
            index={lightboxIndex}
            close={() => setLightboxIndex(-1)}
            plugins={[Zoom, Fullscreen, Slideshow, Thumbnails]}
            zoom={{
              maxZoomPixelRatio: 3,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              doubleClickMaxStops: 2,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true,
            }}
            slideshow={{
              autoplay: false,
              delay: 3000,
            }}
            thumbnails={{
              position: "bottom",
              width: 120,
              height: 80,
              border: 2,
              borderStyle: "solid",
              borderColor: "#ffffff",
              borderRadius: 8,
              padding: 4,
              gap: 16,
            }}
            styles={{
              container: { 
                backgroundColor: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(10px)",
              },
            }}
            carousel={{
              finite: false,
              preload: 2,
              padding: "16px",
              spacing: "30%",
              imageFit: "contain",
            }}
          />
        )}
      </div>
    </div>
  );
}