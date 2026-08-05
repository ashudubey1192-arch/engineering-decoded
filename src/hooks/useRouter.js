import { useCallback, useEffect, useState, useTransition } from "react";

export default function useRouter() {
  const [path, setPath] = useState(window.location.pathname);
  const [isNavigating, startNavigation] = useTransition();

  useEffect(() => {
    const onPopState = () => {
      startNavigation(() => setPath(window.location.pathname));
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [path]);

  const navigate = useCallback((next) => {
    if (next === window.location.pathname) return;
    window.history.pushState({}, "", next);
    startNavigation(() => setPath(next));
  }, []);

  return { path, navigate, isNavigating };
}
