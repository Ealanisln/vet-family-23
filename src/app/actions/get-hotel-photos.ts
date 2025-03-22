// src/app/actions/get-hotel-photos.ts

"use server";

import cloudinaryV2 from "@/utils/cloudinary";
import { CloudinaryPhoto, CloudinaryResource } from "@/types/cloudinary";

export const getHotelPhotos = async (): Promise<CloudinaryPhoto[]> => {
  try {
    // Specifically query for photos in the hotel-perros folder
    const { resources } = await cloudinaryV2.search
      .expression("resource_type:image AND folder:vet-for-family/hotel-perros")
      .sort_by("public_id", "desc")
      .max_results(30)
      .with_field('tags')
      .execute() as { resources: CloudinaryResource[] };

    const breakpoints = [3840, 2400, 1080, 640, 384, 256, 128, 96, 64, 48];
    
    // Use your cloud name from environment variable
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvf2zo2ee';
    
    const cloudinaryLink = (public_id: string, width: number, height: number) =>
      `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_${width},h_${height}/${public_id}`;

    return resources.map((photo: CloudinaryResource) => {
      const width = breakpoints[0];
      const height = Math.round((photo.height / photo.width) * width);

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
    console.error("Error fetching hotel photos:", error);
    throw new Error("Error al obtener fotografías del hotel.");
  }
};