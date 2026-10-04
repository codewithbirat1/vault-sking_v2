import sanitizeHtml from "sanitize-html";

const allowedTags = [...sanitizeHtml.defaults.allowedTags, "img"];

export function sanitizeBlogBody(body: string, title: string): string {
  const normalizedTitle = title.trim().replace(/\s+/g, " ").toLowerCase();

  return sanitizeHtml(body, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      h1: sanitizeHtml.simpleTransform("h2", {}),
    },
    exclusiveFilter: (frame) => {
      if (
        /^h[1-6]$/.test(frame.tag) &&
        frame.text.trim().replace(/\s+/g, " ").toLowerCase() === normalizedTitle
      ) {
        return true;
      }
      return false;
    },
  });
}

export function getBlogDescription(body: string, title: string): string {
  const text = sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 160) || `Read ${title} on the Vault Skin blog.`;
}
