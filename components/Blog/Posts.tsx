import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { BlogPostTitle } from "@/interfaces/blogpost.interface";
import { Card, CardContent } from "../ui";

interface PostsProps {
  data: BlogPostTitle[];
}

const Posts = ({ data }: PostsProps) => {
  return (
    <section className="max-w-screen-lg mx-auto bg-babyblue">
      <div className="-mx-4 flex flex-wrap justify-center">
        <div className="sm:p-4 md:p-12 mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data.map((post, idx) => (
            <Link key={post._id} href={`/blog/${post.slug.current}`}>
              <div key={idx}>
                <Card>
                  <Image
                    src={urlFor(post.mainImage).url()}
                    alt="Blog post image"
                    width={500}
                    height={500}
                    className="h-[200px] rounded-xl object-cover"
                  />
                </Card>
                <CardContent className="mt-5">
                  <h3 className="mb-4 block font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary md:text-xl ">
                    {post.title}
                  </h3>
                  <h2 className="mb-6 border-b border-body-color border-opacity-10 pb-6 text-base font-medium text-body-color dark:border-white dark:border-opacity-10">
                    {post.smallDescription}
                  </h2>
                  <div className="flex items-center">
                    <div className="mr-5 flex items-center border-r border-body-color border-opacity-10 pr-5 dark:border-white dark:border-opacity-10 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5">
                      <div className="mr-4">
                        <div className="w-full">
                          {/* <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                        By {post.author}
                      </h4> */}

                          <p>{post._updatedAt.substring(0, 10)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Posts;

// export default function Posts( {data}: PostsProps[] ) {
//   return (
//     <div className="max-w-screen-lg mx-auto bg-babyblue" id="blog">
//       <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
//         <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
//           Artículos de interés
//         </h3>
//         <h5 className="text-black opacity-60 text-lg font-normal text-center">
//           ¡Bienvenido a nuestro blog veterinario! Explora artículos informativos
//           y consejos expertos para mantener a tus mascotas felices y saludables.
//           Estamos aquí para brindarte la mejor información sobre el cuidado y
//           bienestar animal.
//         </h5>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4 lg:gap-x-8 mt-10">
//           {posts.map((post) => (
//             <Link
//               key={post._id}
//               href={`/blog/${post.slug.current}`}
//               className="p-4 hover:bg-blue-50"
//             >
//               <div
//                 key={post._id}
//                 className="bg-white rounded-2xl p-5 featureShadow flex flex-col items-center"
//               >
//                 {/* {post?.mainImage ? (
//                   <Image
//                     className="w-full h-auto rounded-lg"

//                     width={800}
//                     height={600}
//                     alt={post?.mainImage?.alt || ""}
//                   />
//                 ) : null} */}

//                 <h2 className="text-xl font-semibold text-black mt-5">
//                   {post.title}
//                 </h2>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
