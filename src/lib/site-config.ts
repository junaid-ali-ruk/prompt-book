type EnvLike = Record<string, string | undefined>;

export const APP_NAME = "Prompt Gallery";
export const APP_TITLE = `${APP_NAME} | Share and discover AI prompts`;
export const DEFAULT_PAGE_DESCRIPTION = "Discover, save, and share AI prompts for Lovable, v0, Bolt, Cursor, and other AI tools.";

function getMergedEnv(): EnvLike {
  const metaEnv = ((import.meta as ImportMeta & { env?: EnvLike }).env ?? {}) as EnvLike;
  const processEnv = typeof process !== "undefined" ? (process.env as EnvLike) : {};
  return { ...processEnv, ...metaEnv };
}

export function normalizeSiteOrigin(value?: string | null) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  try {
    return new URL(trimmedValue).origin;
  } catch {
    return null;
  }
}

export const configuredSiteOrigin = normalizeSiteOrigin(getMergedEnv().VITE_SITE_URL);

export function getSiteOrigin(fallback?: string | null) {
  return configuredSiteOrigin ?? normalizeSiteOrigin(fallback);
}

export function buildAbsoluteUrl(origin: string, path: string) {
  return new URL(path, origin).toString();
}

export function buildPageTitle(pageTitle?: string | null) {
  const trimmedTitle = pageTitle?.trim();
  return trimmedTitle ? `${trimmedTitle} | ${APP_NAME}` : APP_TITLE;
}

export function buildPageDescription(description?: string | null) {
  const trimmedDescription = description?.trim();
  return trimmedDescription || DEFAULT_PAGE_DESCRIPTION;
}

export function summarizeForMetadata(text?: string | null, maxLength = 155) {
  const normalizedText = text?.replace(/\s+/g, " ").trim();
  if (!normalizedText) return DEFAULT_PAGE_DESCRIPTION;
  if (normalizedText.length <= maxLength) return normalizedText;
  return `${normalizedText.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildRobotsTxt(origin: string) {
  return ["User-agent: *", "Allow: /", `Sitemap: ${buildAbsoluteUrl(origin, "/sitemap.xml")}`, ""].join("\n");
}

export function buildSitemapXml(origin: string) {
  const urls = ["/", "/auth"];
  const urlNodes = urls
    .map(url => `<url><loc>${buildAbsoluteUrl(origin, url)}</loc><changefreq>weekly</changefreq></url>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlNodes}</urlset>`;
}
