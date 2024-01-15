"use client";

import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "@sanity/client";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import Share from "./Share";

const builder = imageUrlBuilder(client);

// ... Import statements

export default function Post({ post }: { post: SanityDocument }) {
  if (!post) {
    // Handle the case when post is null or undefined
    return <div>Loading...</div>; // or any other fallback UI
  }

  return (
    <section className="mx-8">
    <main className="container my-4 mx-auto">
      <div className="-mx-4 flex flex-wrap justify-center">
        <div className="w-full px-4 lg:w-8/12">
        {post?.mainImage ? (
           <div className="mx-auto max-w-[500px]"> 
            <Image
              className="rounded-lg border pb-8"
              src={builder.image(post.mainImage).url()}
              width={500}
              height={500}
              alt={post?.mainImage?.alt || ""}
            />
            </div>
          ) : null}
          
          <h1>
            <span className="mb-8 text-3xl font-bold leading-tight text-black sm:text-4xl sm:leading-tight">
              {post.title || "Untitled"}
            </span>
          </h1>
         
          <div className="prose prose-xl prose-blue mt-16">
          {post?.body ? <PortableText value={post.body} /> : null}
          </div>
          <hr className="my-8 border-t border-gray-400" />
          <Share post={post} />
          
        </div>
      </div>
    </main>
    </section>
  );
}
