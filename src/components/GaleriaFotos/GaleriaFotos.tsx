"use client";

import { useEffect, useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from 'framer-motion';
import { Camera } from "lucide-react";
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

export default function App() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState<CloudinaryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<CloudinaryPhoto[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([DEFAULT_TAG]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        const photos = await getCloudinaryPhotos();
        setCloudinaryPhotos(photos);
        const tags = Array.from(new Set(photos.flatMap(photo => photo.tags)));
        setAllTags(tags);
        const initialFiltered = photos.filter(photo => photo.tags.includes(DEFAULT_TAG));
        setFilteredPhotos(initialFiltered);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPhotos(cloudinaryPhotos);
    } else {
      const filtered = cloudinaryPhotos.filter(photo =>
        selectedTags.some(tag => photo.tags.includes(tag))
      );
      setFilteredPhotos(filtered);
    }
  }, [selectedTags, cloudinaryPhotos]);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 mb-4 mx-auto animate-bounce text-blue-500" />
          <p className="text-lg text-gray-600">Cargando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Nuestras instalaciones
          </h3>
          <p className="text-gray-600 text-lg font-normal text-center max-w-3xl mx-auto leading-relaxed">
            Explora nuestra galería de fotos dedicada a nuestras queridas mascotas y
            los servicios de atención veterinaria que ofrecemos. Desde adorables
            cachorros hasta felices gatitos, nuestras imágenes capturan momentos
            especiales en la vida de tus compañeros peludos.
          </p>
        </motion.div>

        <motion.div 
          className="my-8 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`
                px-4 py-2 rounded-full transition-all duration-300 ease-in-out
                ${selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}
                font-medium text-sm
              `}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <motion.div 
          className="pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <PhotoAlbum
            photos={filteredPhotos}
            layout="masonry"
            targetRowHeight={250} // Reduced height for better mobile view
            onClick={({ index }) => {
              console.log("Click en imagen:", index);
              setLightboxIndex(index);
            }}
            columns={(containerWidth) => {
              if (containerWidth < 640) return 2; // Changed from 1 to 2 columns for mobile
              if (containerWidth < 800) return 2;
              if (containerWidth < 1200) return 3;
              return 4;
            }}
            spacing={(containerWidth) => {
              return containerWidth < 640 ? 8 : 16; // Smaller gap for mobile devices
            }}
          />
        </motion.div>

        {lightboxIndex >= 0 && (
          <Lightbox
            slides={filteredPhotos}
            open={true}
            index={lightboxIndex}
            close={() => setLightboxIndex(-1)}
          />
        )}
      </div>
    </div>
  );
}