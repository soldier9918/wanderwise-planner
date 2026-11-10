import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Opens every page at the top. Links to a #section still jump to that section. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}
