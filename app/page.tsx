import Banner from "./components/Banner/index";
// import Construction from './components/Construction/index';
import Reviews from "./components/Reviews/index";
import Servicios from "./components/Servicios/index";
import Posts from "./components/Blog/Posts";
import Business from "./components/Business/index";
import HomeDelivery from "./components/HomeDelivery/index";
import Location from "./components/Location/index";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/sanityFetch";
import { postPathsQuery, postsQuery } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";

// Prepare Next.js to know which routes already exist
export async function generateStaticParams() {
  // Important, use the plain Sanity Client here
  const posts = await client.fetch(postPathsQuery);
  return posts;
}

export default async function Home() {
  const posts = await sanityFetch<SanityDocument[]>({ query: postsQuery });

  return (
    <main>
      {/* <Construction /> */}
      <Banner />
      <Reviews />
      <Servicios />
      <Posts posts={posts} />
      <Business />
      <HomeDelivery />
      <Location />
    </main>
  );
}
