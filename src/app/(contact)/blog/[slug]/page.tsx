// ./nextjs-app/app/[slug]/page.tsx

import { SanityDocument } from "@sanity/client";
import Post from "../../../../components/Blog/Post";
import { postPathsQuery, postQuery } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/sanityFetch";
import { client } from "@/sanity/lib/client";

export const revalidate = 30;

export async function generateStaticParams() {
  const posts = await client.fetch(postPathsQuery);

  return posts;
}

interface PageParams {
  slug: string;
}

export default async function Page({ params }: { params: PageParams }) {
  const post = await sanityFetch<SanityDocument>({ query: postQuery, params });

  return <Post post={post} />;
}
