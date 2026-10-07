export const SITE_URL = "https://vaultskin.co";

export const canonicalUrl = (path: string) =>
  new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
