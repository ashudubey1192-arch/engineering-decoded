import type { Metadata } from "next";
import Article from "./article";

export const metadata: Metadata = {
  title: "PostgreSQL LISTEN/NOTIFY with Java: Real-Time Change Notifications | Engineering Decoded",
  description:
    "Build PostgreSQL LISTEN/NOTIFY with Java and Spring Boot, invalidate caches safely, and understand delivery, pooling, payload, and scaling limits.",
  keywords: [
    "PostgreSQL LISTEN NOTIFY Java",
    "Spring Boot PostgreSQL notifications",
    "distributed cache invalidation",
    "PostgreSQL event notifications",
    "Java PostgreSQL listener",
    "LISTEN NOTIFY limitations",
  ],
};

export default function Home() {
  return <Article />;
}
