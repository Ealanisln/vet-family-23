"use server";

import cloudinary from "cloudinary";

type CloudinaryPhoto = {
  public_id: string;
  src: string; 
  width: number;
  height: number;
  srcSet: {
    src: string;
    width: number;
    height: number;
  }[];
};

export const getCloudinaryPhotos = async (): Promise<CloudinaryPhoto[]> => {
  try {
    const { resources } = await cloudinary.v2.search
      .expression("resource_type:image AND tags=Instalaciones")
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute();

    const breakpoints = [3840, 2400, 1080, 640, 384, 256, 128, 96, 64, 48];
    const cloudinaryLink = (public_id: string, width: number, height: number) =>
      `https://res.cloudinary.com/dvf2zo2ee/image/upload/c_fit,w_${width},h_${height}/${public_id}`;

    return resources.map((photo: CloudinaryPhoto) => {
      const width = breakpoints[0];
      const height = (photo.height / photo.width) * width;

      return {
        public_id: photo.public_id, // Correctly access public_id property
        height: photo.height,
        width: photo.width,
        src: cloudinaryLink(photo.public_id, width, height), // Use photo.public_id here
        srcSet: breakpoints.map((breakpoint) => {
          const height = Math.round((photo.height / photo.width) * breakpoint);
          return {
            src: cloudinaryLink(photo.public_id, breakpoint, height), // Use photo.public_id here
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
