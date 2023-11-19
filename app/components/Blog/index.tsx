
import { SanityDocument } from "next-sanity";
import Posts from "./Posts";
import { postsQuery } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/sanityFetch";

export default async function Home() {
  const posts = await sanityFetch<SanityDocument[]>({ query: postsQuery });

  return <Posts posts={posts} />;
}