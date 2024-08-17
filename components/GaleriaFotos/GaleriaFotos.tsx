"use client";

import { useEffect, useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

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
  const [index, setIndex] = useState(-1);
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState<CloudinaryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<CloudinaryPhoto[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([DEFAULT_TAG]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photos = await getCloudinaryPhotos();
        setCloudinaryPhotos(photos);

        // Extract all unique tags
        const tags = Array.from(new Set(photos.flatMap(photo => photo.tags)));
        setAllTags(tags);

        // Apply initial filter for DEFAULT_TAG
        const initialFiltered = photos.filter(photo => photo.tags.includes(DEFAULT_TAG));
        setFilteredPhotos(initialFiltered);
      } catch (error) {
        console.error("Error fetching photos:", error);
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

  return (
    <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
        Nuestras instalaciones:
      </h3>
      <h5 className="text-black opacity-60 text-lg font-normal text-center">
        Explora nuestra galería de fotos dedicada a nuestras queridas mascotas y
        los servicios de atención veterinaria que ofrecemos. Desde adorables
        cachorros hasta felices gatitos, nuestras imágenes capturan momentos
        especiales en la vida de tus compañeros peludos mientras brindamos
        atención experta y cariñosa.
      </h5>
      <div className="my-4 flex flex-wrap justify-center">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`m-1 px-3 py-1 rounded ${
              selectedTags.includes(tag)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="pt-8">
        <PhotoAlbum
          photos={filteredPhotos}
          layout="rows"
          targetRowHeight={150}
          onClick={({ index }) => setIndex(index)}
          columns={(containerWidth) => {
            if (containerWidth < 400) return 2;
            if (containerWidth < 800) return 3;
            return 4;
          }}
        />

        <Lightbox
          slides={filteredPhotos}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        />
      </div>
    </div>
  );
}