import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { seoFor } from "@/lib/seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = content;
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const s = seoFor(pathname);
    document.title = s.title;
    setMeta("name", "description", s.description);
    setMeta("property", "og:title", s.title);
    setMeta("property", "og:description", s.description);
    setMeta("name", "robots", s.index ? "index, follow" : "noindex, nofollow");
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (s.canonical) {
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = s.canonical;
      setMeta("property", "og:url", s.canonical);
    } else link?.remove();
  }, [pathname]);
  return null;
}
