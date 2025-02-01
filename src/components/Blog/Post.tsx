"use client";

import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "@sanity/client";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
} from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import Share from "./Share";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const builder = imageUrlBuilder(client);

interface ImageValue {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
}

interface CodeValue {
  _type: "code";
  code?: string;
}

interface LinkMark {
  _type: "link";
  href: string;
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: ImageValue }) => (
      <div className="my-8 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={builder.image(value).url()}
          width={1200}
          height={675}
          className="w-full h-auto object-cover"
          alt={value.alt || "Imagen del post"}
        />
        {value.caption && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {value.caption}
          </p>
        )}
      </div>
    ),
    code: ({ value }: { value: CodeValue }) => (
      <pre className="p-4 my-6 rounded-lg bg-gray-800 text-gray-100 overflow-x-auto">
        <code>{value.code}</code>
      </pre>
    ),
  },

  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900">
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="my-4 text-lg leading-relaxed text-gray-700">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-[#91D8D9] pl-4 my-6 italic text-gray-600">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-4 list-disc pl-6 space-y-2 text-gray-700">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-4 list-decimal pl-6 space-y-2 text-gray-700">
        {children}
      </ol>
    ),
  },

  marks: {
    link: ({
      children,
      value,
    }: {
      children?: React.ReactNode;
      value?: LinkMark;
    }) => (
      <a
        href={value?.href}
        className="text-gray-800 hover:text-gray-900 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
  },
};

interface PostProps {
  post: SanityDocument & {
    title?: string;
    _updatedAt?: string;
    mainImage?: ImageValue;
    body?: PortableTextBlock[];
  };
}

export default function Post({ post }: PostProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (post?._updatedAt) {
      const date = new Date(post._updatedAt);
      if (!isNaN(date.getTime())) {
        setFormattedDate(
          date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
      }
    }
  }, [post?._updatedAt]);

  if (!post || !mounted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-r from-[#91D8D9]/20 to-white flex items-center justify-center">
        <div className="animate-pulse text-xl font-semibold text-gray-600">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-r from-[#91D8D9]/20 to-white -z-10" />
      <article className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver al blog</span>
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title || "Sin título"}
            </h1>

            {formattedDate && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <time dateTime={post._updatedAt}>{formattedDate}</time>
              </div>
            )}
          </header>

          {post?.mainImage && (
            <div className="mb-8">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={builder.image(post.mainImage).url()}
                  width={1200}
                  height={675}
                  className="w-full h-auto object-contain"
                  alt={post?.mainImage?.alt || post.title || ""}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              {post?.body ? (
                <PortableText
                  value={post.body}
                  components={portableTextComponents}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Share post={post} />
          </div>
        </div>
      </article>
    </>
  );
}
