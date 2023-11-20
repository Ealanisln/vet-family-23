"use client";

import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "@sanity/client";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";

const builder = imageUrlBuilder(client);

// ... Import statements

export default function Post({ post }: { post: SanityDocument }) {
  if (!post) {
    // Handle the case when post is null or undefined
    return <div>Loading...</div>; // or any other fallback UI
  }

  return (
    <main className="container mx-auto prose prose-lg p-4">
      <h1>{post.title || "Untitled"}</h1>
      {post?.mainImage ? (
        <Image
          className="float-left m-0 w-1/3 mr-4 rounded-lg"
          src={builder.image(post.mainImage).width(300).height(300).url()}
          width={300}
          height={300}
          alt={post?.mainImage?.alt || ""}
        />
      ) : null}
      {post?.body ? <PortableText value={post.body} /> : null}
    </main>
  );
}
