// ./nextjs-app/app/[slug]/page.tsx
import { SanityDocument } from "@sanity/client";
import { Metadata } from "next";
import Post from "../../../../components/Blog/Post";
import { postPathsQuery, postQuery } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/sanityFetch";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/client";

export const revalidate = 30;

interface PageParams {
  slug: string;
}

export async function generateStaticParams() {
  const posts = await client.fetch(postPathsQuery);
  return posts;
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const post = await sanityFetch<SanityDocument>({ query: postQuery, params });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const { title, mainImage, seo } = post;

  const ogImage = seo?.openGraph?.image
    ? urlFor(seo.openGraph.image).url()
    : mainImage
      ? urlFor(mainImage).url()
      : undefined;

  return {
    title: seo?.metaTitle ?? `${title} | Vet Family`,
    description: seo?.metaDescription ?? title,
    openGraph: {
      title: seo?.openGraph?.title ?? title,
      description: seo?.openGraph?.description ?? seo?.metaDescription ?? title,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: seo?.openGraph?.siteName ?? "Your Site Name",
      url: seo?.openGraph?.url,
    },
    twitter: seo?.twitter
      ? {
          card: seo.twitter.cardType as
            | "summary"
            | "summary_large_image"
            | "app"
            | "player",
          site: seo.twitter.site,
          creator: seo.twitter.creator,
        }
      : undefined,
    keywords: seo?.seoKeywords?.join(", "),
  };
}

export default async function Page({ params }: { params: PageParams }) {
  const post = await sanityFetch<SanityDocument>({ query: postQuery, params });

  if (!post) {
    return null;
  }

  return (
    <>
      <Post post={post} />
    </>
  );
}