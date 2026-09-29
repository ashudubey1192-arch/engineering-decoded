const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((lesson) => ({
    title: lesson,
    slug: `${slug}--${lesson.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    time: "12 min",
    sectionSlug: slug,
  })),
});

const sections = [
  section("foundations", "RAG Foundations", [
    "Why Retrieval-Augmented Generation",
    "RAG Architecture and the Request Lifecycle",
    "When to Use RAG, Fine-Tuning, or Both",
    "Grounding, Context Limits, and RAG Trade-Offs",
  ]),
  section("ingestion", "Prepare and Ingest Knowledge", [
    "Connectors, Source Documents, and Ingestion Pipelines",
    "Parse PDFs, HTML, Office Files, and Structured Data",
    "Clean Content and Preserve Document Structure",
    "Metadata, Access Controls, and Document Provenance",
    "Incremental Updates, Deletions, and Re-Indexing",
  ]),
  section("chunking", "Chunking and Embeddings", [
    "Chunking Strategies and Chunk Size",
    "Overlap, Parent-Child Chunks, and Semantic Boundaries",
    "Create Embeddings for Documents and Queries",
    "Embedding Dimensions, Models, and Versioning",
    "Store Vectors and Metadata in a Vector Index",
  ]),
  section("retrieval", "Retrieve Relevant Context", [
    "Vector Similarity and Distance Metrics",
    "Top-K Retrieval and Choosing K",
    "Metadata Filters and Tenant-Aware Search",
    "Keyword Search and BM25",
    "Hybrid Search and Query Rewriting",
    "Reranking Candidates for Better Relevance",
    "Context Compression and Diversity (MMR)",
  ]),
  section("generation", "Generate Grounded Answers", [
    "Assemble Retrieved Context Within a Token Budget",
    "Write Prompts That Ground Answers in Sources",
    "Citations, Source Links, and Evidence Attribution",
    "Handle Missing Evidence and Abstain Gracefully",
    "Conversation History and Multi-Turn RAG",
  ]),
  section("evaluation", "Evaluate and Improve RAG", [
    "Build a Representative RAG Test Set",
    "Measure Retrieval Recall, Precision, and Ranking Quality",
    "Measure Answer Relevance, Faithfulness, and Coverage",
    "Trace Failures Across Retrieval and Generation",
    "Compare Chunking, Embedding, and Retrieval Changes",
  ]),
  section("production", "Production RAG Systems", [
    "Secure Retrieval and Prevent Cross-User Data Leaks",
    "Defend Against Prompt Injection in Retrieved Content",
    "Manage Latency, Caching, and Token Costs",
    "Monitor Index Freshness, Quality, and Availability",
    "Design a Reliable RAG Service and Deployment Workflow",
  ]),
];

export const ragCourse = {
  moduleId: "ai",
  name: "RAG",
  sections,
  articles: sections.flatMap((item) => item.lessons),
  componentPath: "ai/rag",
};
