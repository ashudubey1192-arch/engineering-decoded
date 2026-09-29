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
  section("foundations", "Generative AI Foundations", [
    "What Generative AI Can and Cannot Do",
    "Large Language Models and Their Capabilities",
    "Tokens, Tokenization, and Context Windows",
    "Pretraining, Fine-Tuning, and Inference",
  ]),
  section("transformers", "Transformers and Language Models", [
    "The Transformer Architecture",
    "Self-Attention and Attention Scores",
    "Positional Information and Transformer Blocks",
    "How an LLM Generates the Next Token",
  ]),
  section("generation", "Prompting and Text Generation", [
    "Prompt Structure and Instruction Following",
    "Temperature and Randomness",
    "Top-K Sampling",
    "Top-P (Nucleus) Sampling and Other Decoding Controls",
    "Structured Outputs and Reliable Responses",
  ]),
  section("embeddings", "Embeddings and Vector Search", [
    "What Embeddings Represent",
    "Creating and Comparing Text Embeddings",
    "Vectors, Dimensions, and Similarity Metrics",
    "Vector Indexes and Approximate Nearest Neighbors",
    "Choosing a Top-K Retrieval Result Set",
  ]),
  section("rag", "Retrieval-Augmented Generation", [
    "RAG Architecture and Data Flow",
    "Document Parsing, Chunking, and Metadata",
    "Indexing Documents for Retrieval",
    "Semantic Search, Keyword Search, and Hybrid Retrieval",
    "Reranking, Context Assembly, and Citations",
    "Evaluate and Troubleshoot a RAG Pipeline",
  ]),
  section("agents", "AI Agents and Tool Use", [
    "What Makes an AI Agent",
    "Tool Calling and Function Schemas",
    "Planning, State, and Multi-Step Workflows",
    "Memory, Context, and Agent Handoffs",
    "Human Approval, Permissions, and Safe Tool Use",
    "Evaluate Agent Reliability and Failure Recovery",
  ]),
  section("production", "Building Generative AI Applications", [
    "Choose a Model and Manage API Calls",
    "Latency, Token Cost, Caching, and Streaming",
    "LLM Evaluation with Test Sets and Human Review",
    "Guardrails, Privacy, and Prompt Injection",
    "Monitor Quality and Improve in Production",
  ]),
];

export const generativeAICourse = {
  moduleId: "ai",
  name: "Generative AI",
  sections,
  articles: sections.flatMap((item) => item.lessons),
  componentPath: "ai/generative-ai",
};
