import Container from "@/components/Container";
import Title from "@/components/layout/Products/Title";
import BlogCoverImage from "@/components/layout/Blogs/BlogCoverImage";
import { getAllBlogs } from "@/lib/frontend-data";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Skincare tips, product guides, and beauty insights from Vault Skin — your trusted skincare destination in Nepal.",
};

const BlogPage = async () => {
  const blogs = await getAllBlogs();

  return (
    <div>
      <Container>
        <Title className="py-4">Latest Blogs</Title>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 py-2 md:py-5 px-4 md:px-0">
          {blogs?.map((blog) => (
            <div
              key={blog?._id}
              className="group w-full max-w-sm mx-auto md:max-w-none md:mx-0 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <BlogCoverImage
                  src={blog.mainImage}
                  alt={blog.mainImageAlt?.trim() || blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="bg-gray-50 p-2.5">
                <div className="text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 relative group cursor-pointer">
                    {blog?.blogcategories?.map((item, index) => (
                      <p
                        key={index}
                        className="font-semibold text-primary tracking-wide text-[16px]"
                      >
                        {item?.title}
                      </p>
                    ))}
                    <span className="absolute left-0 -bottom-1 bg-surface/30 w-full h-[2px] group-hover:bg-primary transition-all" />
                  </div>

                  <p className="flex items-center gap-1 text-surface text-[11px] hover:text-primary transition-colors cursor-pointer">
                    <Calendar size={13} />
                    {dayjs(blog.publishedAt).format("MMM D, YYYY")}
                  </p>
                </div>

                <Link
                  href={`/blog/${blog?.slug?.current}`}
                  className="block text-sm font-semibold mt-2 line-clamp-2 hover:text-primary transition-colors"
                >
                  {blog?.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default BlogPage;
