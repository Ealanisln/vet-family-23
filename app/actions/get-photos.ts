"use server";

import cloudinary from "@/utils/cloudinary";

type CloudinaryPhoto = {
  public_id: string;
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

export const getCloudinaryPhotos = async (): Promise<CloudinaryPhoto[]> => {
  try {
    const { resources } = await cloudinary.v2.search
      .expression("resource_type:image")
      .sort_by("public_id", "desc")
      .max_results(30)
      .with_field('tags')
      .execute();

    const breakpoints = [3840, 2400, 1080, 640, 384, 256, 128, 96, 64, 48];
    const cloudinaryLink = (public_id: string, width: number, height: number) =>
      `https://res.cloudinary.com/dvf2zo2ee/image/upload/c_fit,w_${width},h_${height}/${public_id}`;

    return resources.map((photo: any) => {
      const width = breakpoints[0];
      const height = (photo.height / photo.width) * width;

      return {
        public_id: photo.public_id,
        height: photo.height,
        width: photo.width,
        tags: photo.tags || [],
        src: cloudinaryLink(photo.public_id, width, height),
        srcSet: breakpoints.map((breakpoint) => {
          const height = Math.round((photo.height / photo.width) * breakpoint);
          return {
            src: cloudinaryLink(photo.public_id, breakpoint, height),
            width: breakpoint,
            height,
          };
        }),
      };
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error al obtener fotografias.");
  }
};