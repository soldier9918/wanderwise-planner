import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls the section with this id into view. Returns true when it was found. */
export function scrollToSection(id: string, behavior: ScrollBehavior = "auto") {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

/**
 * Opens every page at the top. A link to a #section scrolls to that section
 * instead, retrying for a moment so late-rendering content still gets found.
 */
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    let timer = 0;
    let tries = 0;
    const attempt = () => {
      if (scrollToSection(id)) return;
      if (++tries >= 25) return;
      timer = window.setTimeout(attempt, 80);
    };
    attempt();

    return () => window.clearTimeout(timer);
  }, [pathname, hash, key]);

  return null;
}
