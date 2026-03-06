import { useEffect, useState } from "react";

export interface AppRoute {
  pathname: string;
  promptId: string | null;
  isNotFound: boolean;
}

const ROUTE_CHANGE_EVENT = "prompt-book:route-change";
const PROMPT_ID_PATHS = new Set(["/prompt", "/edit"]);
const KNOWN_PATHS = new Set(["/", "/auth", "/share", "/me", "/admin", ...PROMPT_ID_PATHS]);

function toUrl(target: string | URL) {
  return target instanceof URL ? new URL(target) : new URL(target, "https://prompt-book.local");
}

export function parseRoute(target: string | URL): AppRoute {
  const url = toUrl(target);
  const pathname = url.pathname || "/";

  return {
    pathname,
    promptId: PROMPT_ID_PATHS.has(pathname) ? url.searchParams.get("id") : null,
    isNotFound: !KNOWN_PATHS.has(pathname),
  };
}

export function buildRouteUrl(target: string | URL, pathname: string, promptId: string | null = null) {
  const url = toUrl(target);
  url.pathname = pathname;

  if (PROMPT_ID_PATHS.has(pathname) && promptId) {
    url.searchParams.set("id", promptId);
  } else {
    url.searchParams.delete("id");
  }

  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

export function getCurrentRoute() {
  return parseRoute(window.location.href);
}

function notifyRouteChange() {
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
}

function updateRoute(pathname: string, promptId: string | null, mode: "push" | "replace" = "push") {
  const nextUrl = buildRouteUrl(window.location.href, pathname, promptId);
  window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", nextUrl);
  notifyRouteChange();
}

export function navigateTo(pathname: string, mode: "push" | "replace" = "push") {
  updateRoute(pathname, null, mode);
}

export function openPrompt(promptId: string, mode: "push" | "replace" = "push") {
  updateRoute("/prompt", promptId, mode);
}

export function openPromptEditor(promptId: string, mode: "push" | "replace" = "push") {
  updateRoute("/edit", promptId, mode);
}

export function useRouteState() {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window === "undefined" ? { pathname: "/", promptId: null, isNotFound: false } : getCurrentRoute(),
  );

  useEffect(() => {
    const syncRoute = () => setRoute(getCurrentRoute());

    window.addEventListener("popstate", syncRoute);
    window.addEventListener(ROUTE_CHANGE_EVENT, syncRoute);

    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener(ROUTE_CHANGE_EVENT, syncRoute);
    };
  }, []);

  return {
    route,
    navigateTo,
    openPrompt,
    openPromptEditor,
  };
}