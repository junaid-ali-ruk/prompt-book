import { useEffect } from "react";

import {
  APP_NAME,
  buildAbsoluteUrl,
  buildPageDescription,
  buildPageTitle,
  getSiteOrigin,
} from "@/lib/site-config";

interface PageMetadataOptions {
  title?: string | null;
  description?: string | null;
  canonicalPath?: string;
  noIndex?: boolean;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`;
  const element = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement("meta");
  element.setAttribute(attribute, key);
  element.setAttribute("content", content);
  if (!element.parentElement) document.head.appendChild(element);
}

function upsertCanonical(href: string) {
  const element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement("link");
  element.setAttribute("rel", "canonical");
  element.setAttribute("href", href);
  if (!element.parentElement) document.head.appendChild(element);
}

export function usePageMetadata({ title, description, canonicalPath, noIndex = false }: PageMetadataOptions) {
  useEffect(() => {
    const siteOrigin = getSiteOrigin(window.location.origin) ?? window.location.origin;
    const canonicalUrl = buildAbsoluteUrl(siteOrigin, canonicalPath ?? `${window.location.pathname}${window.location.search}`);
    const pageTitle = buildPageTitle(title);
    const pageDescription = buildPageDescription(description);
    const robots = noIndex ? "noindex, nofollow" : "index, follow";

    document.title = pageTitle;
    upsertCanonical(canonicalUrl);
    upsertMeta("name", "description", pageDescription);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:site_name", APP_NAME);
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDescription);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDescription);
  }, [canonicalPath, description, noIndex, title]);
}
