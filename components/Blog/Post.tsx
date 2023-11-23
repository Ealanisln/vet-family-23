"use client";

import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "@sanity/client";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  XIcon,
} from "react-share";

const builder = imageUrlBuilder(client);

// ... Import statements

export default function Post({ post }: { post: SanityDocument }) {
  if (!post) {
    // Handle the case when post is null or undefined
    return <div>Loading...</div>; // or any other fallback UI
  }

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "http://www.familyvet23.com";
  const title = post.title;

  return (
    <main className="container mx-auto prose prose-lg py-24">
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
      <hr className="my-8 border-t border-gray-400" />

      <h3 className="text-2xl sm:text-xl font-semibold text-black text-left my-10">
        Comparte este artículo en redes sociales:
      </h3>


      <div className="flex space-x-4">
        <TwitterShareButton
          url={shareUrl}
          title={title}
          className="Demo__some-network__share-button"
        >
          <XIcon size={32} round />
        </TwitterShareButton>

        <FacebookShareButton
          url={shareUrl}
          className="Demo__some-network__share-button"
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </main>
  );
}
