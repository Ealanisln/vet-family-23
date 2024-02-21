"use client";

import { useEffect, useState } from "react";

import PhotoAlbum from "react-photo-album";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
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
  srcSet: {
    src: string;
    width: number;
    height: number;
  }[];
};

export default function App() {
  const [index, setIndex] = useState(-1);
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState<CloudinaryPhoto[]>(
    []
  );

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photos = await getCloudinaryPhotos();
        setCloudinaryPhotos(photos);
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    fetchPhotos();
  }, []);

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
      <div className="pt-8">
        <PhotoAlbum
          photos={cloudinaryPhotos}
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
          slides={cloudinaryPhotos}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          // enable optional lightbox plugins
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        />
      </div>
    </div>
  );
}
