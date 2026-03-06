import { serve } from "bun";
import index from "./index.html";

import { buildRobotsTxt, buildSitemapXml } from "./lib/site-config";

const server = serve({
  routes: {
    "/robots.txt": req => new Response(buildRobotsTxt(new URL(req.url).origin), {
      headers: { "content-type": "text/plain; charset=utf-8" },
    }),
    "/sitemap.xml": req => new Response(buildSitemapXml(new URL(req.url).origin), {
      headers: { "content-type": "application/xml; charset=utf-8" },
    }),
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Prompt Gallery frontend running at ${server.url}`);
