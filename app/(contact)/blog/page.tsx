import Posts from "@/components/Blog/Posts";
import React from "react";
import { postPathsQuery } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { BlogPostTitle } from "@/interfaces/blogpost.interface";

export const revalidate = 30;

// Prepare Next.js to know which routes already exist
export async function generateStaticParams() {
  // Important, use the plain Sanity Client here
  const posts = await client.fetch(postPathsQuery);
  return posts;
}

async function getData() {
  const query = `
  *[_type == 'post'] {
    _id,
    _updatedAt,
    title,
    slug,
    mainImage,
    smallDescription,
    author-> {
      _id,
      name
    }
  }  
  `;
  const data = await client.fetch(query);
  return data;
}

const page = async () => {
  const data: BlogPostTitle[] = await getData();

  return <Posts data={data} />;
};

export default page;
