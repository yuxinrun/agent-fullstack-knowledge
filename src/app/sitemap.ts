import type { MetadataRoute } from "next";
import {
  domains,
  allTutorials,
  architectures,
  labs,
  tools,
  caseStudies,
  learningPaths,
} from "@/content/tutorials";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://yuxinrun.github.io/agent-fullstack-knowledge";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/domains",
    "/tutorials",
    "/learning-paths",
    "/architecture",
    "/labs",
    "/tools",
    "/case-studies",
    "/glossary",
    "/search",
    "/about",
    "/knowledge-graph",
    "/progress",
  ].map((p) => ({ url: siteUrl + p, lastModified: now }));

  const domainRoutes = domains.map((d) => ({
    url: siteUrl + `/domains/${d.slug}`,
    lastModified: now,
  }));
  const tutorialRoutes = allTutorials.map((t) => ({
    url: siteUrl + `/tutorials/${t.slug}`,
    lastModified: now,
  }));
  const archRoutes = architectures.map((a) => ({
    url: siteUrl + `/architecture/${a.slug}`,
    lastModified: now,
  }));
  const labRoutes = labs.map((l) => ({ url: siteUrl + `/labs/${l.slug}`, lastModified: now }));
  const toolRoutes = tools.map((t) => ({ url: siteUrl + `/tools/${t.slug}`, lastModified: now }));
  const caseRoutes = caseStudies.map((c) => ({
    url: siteUrl + `/case-studies/${c.slug}`,
    lastModified: now,
  }));
  const pathRoutes = learningPaths.map((p) => ({
    url: siteUrl + `/learning-paths/${p.slug}`,
    lastModified: now,
  }));

  return [
    ...staticRoutes,
    ...domainRoutes,
    ...tutorialRoutes,
    ...archRoutes,
    ...labRoutes,
    ...toolRoutes,
    ...caseRoutes,
    ...pathRoutes,
  ];
}
