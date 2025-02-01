import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { BlogPostTitle } from "@/interfaces/blogpost.interface";
import { Card, CardContent } from "../ui";
import { Calendar } from "lucide-react";

interface PostsProps {
  data: BlogPostTitle[];
}

const Posts = ({ data }: PostsProps) => {
  const sortedPosts = data.sort(
    (a, b) => new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
  );

  return (
    <section className="py-12 bg-gradient-to-b from-babyteal to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPosts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <Card className="h-full overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <div className="relative h-48 sm:h-56">
                  <Image
                    src={urlFor(post.mainImage).url()}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors duration-200">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.smallDescription}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-auto">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <time dateTime={post._updatedAt}>
                        {new Date(post._updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Posts;