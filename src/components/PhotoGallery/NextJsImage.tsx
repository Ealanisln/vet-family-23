import Image from "next/image";
import type { RenderPhotoProps } from "react-photo-album";

type PhotoType = {
  src: string;
  width: number;
  height: number;
  srcSet: { src: string; width: number; height: number; }[];
  blurDataURL?: string;
};

export default function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
}: RenderPhotoProps<PhotoType>) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Image
        fill
        src={photo.src}
        placeholder={photo.blurDataURL ? "blur" : undefined}
        blurDataURL={photo.blurDataURL}
        {...{ alt, title, sizes, className, onClick }}
      />
    </div>
  );
}