import Link from "next/link";
import type { SanityDocument } from "@sanity/client";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/sanity/lib/client";

const builder = imageUrlBuilder(client);

export default function Posts({ posts = [] }: { posts: SanityDocument[] }) {
  return (
    <div className="bg-babyblue" id="blog">
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
            <div
              key={post._id}
              className="bg-white rounded-2xl p-5 featureShadow"
            >
              <Link
                key={post._id}
                href={`/blog/${post.slug.current}`}
                className="p-4 hover:bg-blue-50"
              >
                <h2 className="text-xl font-semibold text-black mt-5">
                  {post.title}
                </h2>
              </Link>
              {post?.mainImage ? (
                <Image
                  className="float-left m-0 w-1/3 mr-4 rounded-lg"
                  src={builder
                    .image(post.mainImage)
                    .width(300)
                    .height(300)
                    .url()}
                  width={300}
                  height={300}
                  alt={post?.mainImage?.alt || ""}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
