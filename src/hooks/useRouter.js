import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export default function useRouter() {
  const [path, setPath] = useState(window.location.pathname);
  const [isNavigating, startNavigation] = useTransition();
  const nextScrollBehavior = useRef("auto");

  useEffect(() => {
    const onPopState = () => {
      startNavigation(() => setPath(window.location.pathname));
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const behavior = nextScrollBehavior.current;
    nextScrollBehavior.current = "auto";
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior }));
  }, [path]);

  const navigate = useCallback((next, options = {}) => {
    if (next === window.location.pathname) return;
    nextScrollBehavior.current = options.scrollBehavior || "auto";
    window.history.pushState({}, "", next);
    startNavigation(() => setPath(next));
  }, []);

  return { path, navigate, isNavigating };
}
