"use client";
import Link from "next/link";
import type { SanityDocument } from "@sanity/client";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/sanity/lib/client";

const builder = imageUrlBuilder(client);

export default function Posts({ posts = [] }: { posts: SanityDocument[] }) {
  return (
    <div className="max-w-screen-lg mx-auto bg-babyblue" id="blog">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
          Artículos de interés
        </h3>
        <h5 className="text-black opacity-60 text-lg font-normal text-center">
          ¡Bienvenido a nuestro blog veterinario! Explora artículos informativos
          y consejos expertos para mantener a tus mascotas felices y saludables.
          Estamos aquí para brindarte la mejor información sobre el cuidado y
          bienestar animal.
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4 lg:gap-x-8 mt-10">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="p-4 hover:bg-blue-50"
            >
              <div
                key={post._id}
                className="bg-white rounded-2xl p-5 featureShadow flex flex-col items-center"
              >
                {post?.mainImage ? (
                  <Image
                    className="w-full h-auto rounded-lg"
                    src={builder
                      .image(post.mainImage)
                      .width(800) // Adjust the desired width
                      .height(600) // Adjust the desired height
                      .url()}
                    width={800}
                    height={600}
                    alt={post?.mainImage?.alt || ""}
                  />
                ) : null}

                <h2 className="text-xl font-semibold text-black mt-5">
                  {post.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
