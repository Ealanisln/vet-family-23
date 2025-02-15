// src/actions/get-blog-posts.ts
import { client } from "@/sanity/lib/client";
import { postsQuery } from "@/sanity/lib/queries";

export interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage: {
    asset: {
      _ref: string;
    };
  };
  _createdAt?: string;
  _updatedAt?: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await client.fetch<BlogPost[]>(postsQuery);
    return posts;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching blog posts:", error);
    return [];
  }
}
