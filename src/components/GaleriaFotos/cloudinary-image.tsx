"use client";

import { CldImage } from "next-cloudinary";
import { ComponentProps } from "react";

export function CloudinaryImage(props: ComponentProps<typeof CldImage>) {
  return <CldImage {...props} />;
}
