/**
 * Centralized image-safety utilities.
 *
 * Every Next.js `<Image>` component in the project should run its `src`
 * through `getSafeImageSrc` so that `undefined`, `null`, and empty-string
 * values never reach the DOM.
 */

/** Path served from `public/` – always exists and always valid. */
export const PLACEHOLDER_IMAGE = "/placeholder-product.png";

/**
 * Returns true for external product image URLs that should bypass
 * Next.js Image Optimization (served directly / unoptimized).
 * This prevents the Next.js proxy from logging 504/404 errors
 * for slow or missing upstream images.
 */
export function isS3Url(src?: string | null): boolean {
  if (!src) return false;
  const s = src.trim();
  return (
    s.startsWith("https://vault-skin.s3.us-east-1.amazonaws.com/") ||
    s.startsWith("https://ik.imagekit.io/vault088/products/")
  );
}

/**
 * Returns a guaranteed non-empty image URL.
 *
 * - `undefined` / `null` / `""` / whitespace-only → placeholder
 * - Otherwise → the trimmed original value
 */
export function getSafeImageSrc(src?: string | null): string {
  if (!src) return PLACEHOLDER_IMAGE;

  const value = src.trim();
  if (value.length === 0) return PLACEHOLDER_IMAGE;

  return value;
}
