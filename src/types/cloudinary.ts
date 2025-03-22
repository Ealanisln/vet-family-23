// src/types/cloudinary.ts

export interface CloudinaryResource {
    public_id: string;
    height: number;
    width: number;
    tags?: string[];
    format: string;
    resource_type: string;
    created_at: string;
    url: string;
    secure_url: string;
  }
  
  export interface CloudinaryPhoto {
    public_id?: string;
    src: string;
    width: number;
    height: number;
    tags: string[];
    srcSet: {
      src: string;
      width: number;
      height: number;
    }[];
  }