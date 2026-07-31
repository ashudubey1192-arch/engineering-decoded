import { useEffect, useState } from "react";

export default function useRouter() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => { const onPop = () => setPath(window.location.pathname); addEventListener("popstate", onPop); return () => removeEventListener("popstate", onPop); }, []);
  const navigate = (next) => { window.history.pushState({}, "", next); setPath(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return { path, navigate };
}
