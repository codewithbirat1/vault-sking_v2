
import Container from "@/components/Container";
import Title from "@/components/layout/Products/Title";
import {
  getBlogCategories,
  getOthersBlog,
  getSingleBlog,
} from "@/lib/frontend-data";
import dayjs from "dayjs";
import { Calendar, ChevronLeftIcon, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getSingleBlog(slug);

  if (!blog) {
    return { title: "Blog" };
  }

  const desc = blog.body?.replace(/<[^>]*>/g, "").slice(0, 160) || `Read ${blog.title} on the Vault Skin blog.`;

  return {
    title: blog.title,
    description: desc,
    openGraph: {
      title: blog.title,
      description: desc,
      images: blog.mainImage ? [{ url: blog.mainImage }] : [],
      type: "article",
    },
  };
}

const SingleBlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const blog = await getSingleBlog(slug);
  if (!blog) return notFound();

  return (
    <div className="py-10">
      <Container className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="md:col-span-3">
          {blog?.mainImage && blog.mainImage.trim().length > 0 && (
            <Image
              src={blog?.mainImage}
              alt={blog.title || "Blog Image"}
              width={800}
              height={500}
              className="w-full max-h-86.5 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="text-xs flex items-center gap-5 my-7">
              <div className="flex items-center relative group cursor-pointer">
                {blog?.blogcategories?.map((item, index) => (
                  <p
                    key={index}
                    className="font-semibold text-primary tracking-wider"
                  >
                    {item?.title}
                  </p>
                ))}
                <span className="absolute left-0 -bottom-1.5 bg-black/30 inline-block w-full h-0.5 group-hover:bg-primary hover:cursor-pointer hoverEffect" />
              </div>
              <p className="flex items-center gap-1 text-black relative group hover:cursor-pointer hover:text-primary hoverEffect">
                <Pencil size={15} /> {blog?.author?.name}
                <span className="absolute left-0 -bottom-1.5 bg-black/30 inline-block w-full h-0.5 group-hover:bg-primary hoverEffect" />
              </p>
              <p className="flex items-center gap-1 text-black relative group hover:cursor-pointer hover:text-primary hoverEffect">
                <Calendar size={15} />{" "}
                {dayjs(blog.publishedAt).format("MMMM D, YYYY")}
                <span className="absolute left-0 -bottom-1.5 bg-black/30 inline-block w-full h-0.5 group-hover:bg-primary hoverEffect" />
              </p>
            </div>
            <h2 className="text-2xl font-bold my-5">{blog?.title}</h2>
            <div className="flex flex-col">
              <div className="text-black">
                <div>
                  {blog.body && (
                    <div
                      className="prose prose-slate max-w-none text-base leading-8"
                      // Safe: `blog.body` is sanitized with DOMPurify before
                      // being saved from the admin blog editor.
                      dangerouslySetInnerHTML={{ __html: blog.body }}
                    />
                  )}
                  <div className="mt-10">
                    <Link href="/blog" className="flex items-center gap-1">
                      <ChevronLeftIcon className="size-5" />
                      <span className="text-sm font-semibold">
                        Back to blog
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BlogLeft slug={slug} />
      </Container>
    </div>
  );
};

const BlogLeft = async ({ slug }: { slug: string }) => {
  const categories = await getBlogCategories();
  const blogs = await getOthersBlog(slug, 5);

  return (
    <div>
      <div className="border border-black p-5 rounded-md">
        <Title className="text-base">Blog Categories</Title>
        <div className="space-y-2 mt-2">
          {categories?.map((item, index) => (
            <div
              key={index}
              className="text-black flex items-center justify-between text-sm font-medium"
            >
              <p>{item?.title}</p>
              <p className="text-primary font-semibold">{`(1)`}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-black p-5 rounded-md mt-10">
        <Title className="text-base">Latest Blogs</Title>
        <div className="space-y-4 mt-4">
          {blogs?.map((blog) => (
            <Link
              href={`/blog/${blog?.slug?.current}`}
              key={blog._id}
              className="flex items-center gap-2 group"
            >
              {blog?.mainImage && blog.mainImage.trim().length > 0 && (
                <Image
                  src={blog?.mainImage}
                  alt="blogImage"
                  width={100}
                  height={100}
                  className="w-16 h-16 rounded-full object-cover border border-primary/10 group-hover:border-primary hoverEffect"
                />
              )}
              <p className="line-clamp-2 text-sm text-black group-hover:text-primary hoverEffect">
                {blog?.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPage;