import { getSingleBlog } from "@/lib/frontend-data";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Invalid blog slug", { status: 400 });
  }

  const blog = await getSingleBlog(slug);
  if (!blog) return new Response("Blog not found", { status: 404 });

  const coverUrl = (() => {
    try {
      const cover = new URL(blog.mainImage || "");
      return cover.protocol === "https:" &&
        cover.hostname === "ik.imagekit.io" &&
        cover.pathname.startsWith("/vault088/")
        ? cover.toString()
        : undefined;
    } catch {
      return undefined;
    }
  })();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#f7f5f2",
      }}
    >
      {coverUrl && (
        // Satori needs a raw img element to embed remote cover pixels.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={blog.mainImageAlt || blog.title}
          width={600}
          height={630}
          style={{ objectFit: "cover" }}
        />
      )}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          color: "#1f3640",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>
          VAULTSKIN / THE JOURNAL
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.15,
            overflow: "hidden",
          }}
        >
          {blog.title}
        </div>
        <div style={{ fontSize: 24, marginTop: 28, color: "#667788" }}>
          Skincare guidance from VaultSkin
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
