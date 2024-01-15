import Posts from "@/components/Blog/Posts";
import React from "react";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/sanityFetch";
import { postPathsQuery, postsQuery } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";

export const revalidate = 30; 


// Prepare Next.js to know which routes already exist
export async function generateStaticParams() {
  // Important, use the plain Sanity Client here
  const posts = await client.fetch(postPathsQuery);
  return posts;
}

const page = async () => {
  const posts = await sanityFetch<SanityDocument[]>({ query: postsQuery });

  return <Posts posts={posts} />;
};

export default page;
