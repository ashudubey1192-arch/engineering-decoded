import { aiEngineerStages as practiceStages } from "./aiEngineerRoadmap";

// Sequence and topic coverage checked against the live roadmap on 2026-10-07.
// Explanations and exercises are original. Alternatives are not prerequisites.
const practice = Object.fromEntries(practiceStages.map((stage) => [stage.id, stage]));
const branch = (title, topics, explanation) => ({ title, topics, explanation });
const step = (id, title, practiceId, hours, branches, overrides = {}) => ({
  ...practice[practiceId],
  id,
  title,
  hours,
  branches,
  ...overrides,
});

const steps = [
  step(
    "prerequisites",
    "Prerequisites",
    "foundations",
    24,
    [
      branch(
        "Choose one development path",
        ["Frontend", "Backend", "Full-stack"],
        "You do not need to complete all three paths. Be able to build and debug a small application, use Git, and make authenticated HTTP requests. Frontend developers should add a server boundary for model credentials.",
      ),
    ],
    { category: "Start here" },
  ),
  step(
    "introduction",
    "Introduction",
    "models",
    8,
    [
      branch(
        "Understand the role",
        [
          "What is an AI engineer?",
          "Roles and responsibilities",
          "Impact on product development",
          "AI engineer vs ML engineer",
        ],
        "AI application engineering connects models, data, and software to a user task. ML engineering often includes training and model infrastructure; titles overlap. Begin by defining the user outcome and the failures the product must handle.",
      ),
      branch(
        "Common terminology",
        [
          "AI vs AGI",
          "Large language models",
          "Training",
          "Inference",
          "Embeddings",
          "Vector databases",
          "RAG",
          "AI agents",
          "Context window",
          "Fine-tuning",
          "Prompt engineering",
          "Context engineering",
        ],
        "Training changes weights; inference uses them. Embeddings represent content numerically, retrieval supplies external evidence, and tools perform operations. AGI describes a broader ambition rather than a feature you need to implement. The following steps unpack these terms.",
      ),
    ],
    {
      summary: "Start with the role, responsibilities, and vocabulary before choosing tools.",
      flow: ["User problem", "AI capability", "Application design", "Measured outcome"],
      example:
        "A support team needs faster answers. Your responsibility is to connect approved policy data to an application, measure answer quality, and route unresolved cases to a person—not merely display generated text.",
      project:
        "Write a one-page brief describing the user, task, data, model boundary, and success criteria for your copilot.",
      checkpoint:
        "Explain how an AI engineer turns an existing model into a useful, measurable product.",
    },
  ),
  step(
    "llm-fundamentals",
    "How LLMs work",
    "models",
    16,
    [
      branch(
        "Core LLM elements",
        ["Tokens", "Context"],
        "A tokenizer turns input into model-specific units. The model predicts output using the supplied context and learned parameters. Budget room for instructions, retrieved material, tool results, conversation history, and the response.",
      ),
      branch(
        "Sampling parameters",
        ["Temperature", "Top-K", "Top-P", "Repetition penalties"],
        "Sampling controls affect which candidate tokens can be selected. Temperature changes distribution sharpness; top-k limits candidate count, while top-p uses cumulative probability. Availability and allowed combinations depend on the model. Lower randomness does not guarantee truth or identical responses.",
      ),
    ],
    { category: "Working with LLMs" },
  ),
  step(
    "prompt-engineering",
    "Prompt engineering",
    "prompting",
    16,
    [
      branch(
        "Prompt anatomy",
        [
          "Input format",
          "System prompting",
          "Role and behavior",
          "Context",
          "Constraints",
          "Structured output",
        ],
        "Define the task, the data to process, and the expected output. Add role or tone instructions only when they affect the result. Validate structured responses independently; a schema-conforming answer can still be incorrect.",
      ),
      branch(
        "Prompting techniques",
        ["Zero-shot", "Few-shot", "ReAct", "Chain of thought (CoT)"],
        "Start with a clear instruction, then add representative examples if needed. ReAct alternates actions with observations. Understand stepwise reasoning as a technique, but evaluate the final answer and checkable evidence rather than relying on a model's explanation as proof.",
      ),
      branch(
        "Model interaction",
        ["Function calling", "Prompt caching", "Streaming responses"],
        "Function calling produces structured action requests for your application to validate. Caching can reuse eligible repeated prompt material, while streaming reveals partial output sooner. Neither removes the need for authorization, final validation, or interruption handling.",
      ),
    ],
    { category: "Working with LLMs" },
  ),
  step(
    "context-engineering",
    "Context engineering",
    "prompting",
    24,
    [
      branch(
        "Fundamentals",
        [
          "Context vs prompt engineering",
          "Context layer",
          "Context sources",
          "MCP",
          "Context security",
          "Context evaluation",
        ],
        "Prompt engineering shapes instructions; context engineering selects and manages the information available to a model. A context layer assembles permitted documents, user state, tool results, and history under a token budget. Test both relevance and isolation between users.",
      ),
      branch(
        "Context techniques",
        [
          "RAG and dynamic filters",
          "Memory systems",
          "Context compaction",
          "Long-context processing",
          "State and historical context",
          "Multi-agent context sharing",
          "Context isolation",
          "Context failure modes",
        ],
        "Retrieve only relevant authorized evidence, preserve durable facts explicitly, and summarize history carefully. Compaction can lose constraints; long inputs can distract; shared agent memory can leak data. Track source, freshness, and access rules for each piece of context.",
      ),
      branch(
        "Tools and context warehouses",
        ["modus", "DataHub", "Atlan", "PostHog"],
        "These are ecosystem examples listed by the reference, not a required combined stack. Start with a simple context assembly function. Evaluate any integration for the data it exposes, its access model, and whether it solves a measured information gap.",
      ),
    ],
    {
      category: "Working with LLMs",
      summary:
        "Control which information reaches the model, how long it stays useful, and who may access it.",
      flow: ["Authorized sources", "Select + filter", "Budget + compact", "Model context"],
      example:
        "A returning customer asks about an order. Preserve the order ID as explicit state, retrieve the latest permitted policy, and discard irrelevant earlier chatter. Never reuse another customer's cached context.",
      codeLabel: "Context assembly · conceptual recipe",
      code: "Context = task instructions\n        + authorized user state\n        + relevant current evidence\n        + bounded conversation history\n        + space reserved for the answer\n\nEvery item: source + timestamp + access scope",
      project:
        "Build a context assembly function and test a long conversation, stale evidence, and two users with different document permissions.",
      checkpoint:
        "Show exactly which sources enter a request and demonstrate that irrelevant or unauthorized data is excluded.",
    },
  ),
  step(
    "model-types",
    "Types of AI models",
    "adaptation",
    8,
    [
      branch(
        "Deployment and access",
        ["Pretrained models", "Closed vs open-source models", "Self-hosted models"],
        "Pretrained describes how weights were obtained; closed or open describes access and licensing; self-hosted describes where inference runs. These are different axes. Inspect the actual license because downloadable weights do not imply unrestricted use.",
      ),
    ],
    {
      category: "AI models",
      summary:
        "Separate model capabilities, licensing, and deployment decisions before selecting a provider.",
    },
  ),
  step(
    "model-selection",
    "Choosing the right model",
    "api",
    24,
    [
      branch(
        "Model families",
        [
          "Anthropic Claude",
          "Google Gemini",
          "OpenAI GPT / o-series",
          "Cohere",
          "Mistral",
          "Meta Llama",
          "DeepSeek",
          "Qwen",
          "Gemma",
        ],
        "The reference groups model families into closed and open ecosystems. Compare a small shortlist against the same task-specific evaluation, then inspect the exact release's license, modalities, context limits, hosting options, and cost. Family names alone do not settle those questions.",
      ),
      branch(
        "Platforms and ecosystem",
        [
          "Hugging Face",
          "Hugging Face Tasks",
          "Hugging Face Hub",
          "Transformers.js",
          "Ollama",
          "LM Studio",
          "OpenRouter",
        ],
        "Explore model discovery and task catalogs, local serving, browser inference, or a routing service as separate options. Pick one path for your first working feature. Check where data is processed and what hardware or provider account the chosen path requires.",
      ),
      branch(
        "APIs and SDKs",
        [
          "OpenAI Responses API",
          "Claude Messages API",
          "Google Gemini API",
          "Hugging Face Inference SDK",
          "OpenAI-compatible APIs",
        ],
        "Choose one interface and build an adapter with timeouts, usage reporting, and validated output. Treat compatibility as something to test: tool schemas, streaming events, and error behavior can differ even when request shapes look similar. Consult the selected provider's current documentation.",
      ),
    ],
    {
      category: "AI models",
      summary:
        "Compare model families, choose an inference route, and make a reliable first API call.",
    },
  ),
  step(
    "embedding-models",
    "Embeddings and embedding models",
    "embeddings",
    16,
    [
      branch(
        "Understand embeddings",
        [
          "What are embeddings?",
          "Semantic search",
          "Data classification",
          "Recommendation systems",
          "Anomaly detection",
        ],
        "Embeddings encode similarities useful for finding related content. Search ranks candidates; classification compares labeled patterns; recommendation finds related items; anomaly detection identifies unusual representations. Validate each use case on real task data—distance is not a universal confidence score.",
      ),
      branch(
        "Embedding model choices",
        [
          "OpenAI Embeddings API",
          "Gemini Embedding",
          "Cohere",
          "Sentence Transformers",
          "Hugging Face models",
          "Jina",
        ],
        "Compare hosted and locally run candidates on retrieval quality, supported languages, input limits, dimensionality, license, and cost. Keep document and query encoders compatible. Rebuild the index when changing the embedding space.",
      ),
    ],
    { category: "Embeddings and vector databases" },
  ),
  step(
    "vector-databases",
    "Vector databases",
    "embeddings",
    16,
    [
      branch(
        "Purpose and functionality",
        ["Store vectors and metadata", "Index embeddings", "Perform similarity search"],
        "A vector index narrows candidate passages efficiently. Keep source IDs and access metadata alongside vectors, filter by user permissions, and retrieve the original text. Measure whether approximate search or filters remove relevant candidates.",
      ),
      branch(
        "Pick one storage option",
        [
          "Chroma",
          "Pinecone",
          "Weaviate",
          "FAISS",
          "LanceDB",
          "Qdrant",
          "Supabase",
          "MongoDB Atlas",
        ],
        "These are alternatives, not eight prerequisites. FAISS is a similarity-search library rather than a complete hosted database. Compare persistence, metadata filtering, updates, tenancy, operations, and scale before selecting a store for the exercise.",
      ),
    ],
    {
      category: "Embeddings and vector databases",
      summary: "Store, index, and retrieve vectors with useful metadata. Learn one option well.",
      flow: ["Chunk + vector", "Source metadata", "Filtered search", "Top-k passages"],
      example:
        "Store refund-policy chunks with document ID, revision, and tenant ID. For a customer question, filter to the correct tenant before ranking passages. A semantically similar policy from another tenant is still an invalid result.",
      project:
        "Load policy chunks into one index, query them with a tenant filter, then update and delete a document without leaving stale results.",
      checkpoint:
        "Demonstrate search, filtering, updates, and deletion; explain your choice of library or database.",
    },
  ),
  step(
    "rag",
    "Retrieval-augmented generation (RAG)",
    "rag",
    24,
    [
      branch(
        "Understand the pattern",
        ["What is RAG?", "RAG use cases", "RAG vs fine-tuning"],
        "RAG supplies external evidence at inference time; fine-tuning changes model behavior through weight updates. Use retrieval for changing source material and inspect behavior/data issues before tuning. The two methods can be combined.",
      ),
      branch(
        "Implement the pipeline",
        ["Chunking", "Embedding", "Vector database", "Retrieval process", "Generation"],
        "Preserve meaningful document boundaries, encode passages, index them, retrieve authorized evidence, and generate an answer with source references. Diagnose retrieval misses separately from unsupported generation.",
      ),
      branch(
        "Implementation choices",
        ["Use SDKs directly", "LangChain", "LlamaIndex", "Haystack", "RAGFlow"],
        "Implement a small direct pipeline first so every transformation is visible. Then consider one framework for ingestion or orchestration. Compare behavior on the same questions; framework adoption is not evidence of better answer quality.",
      ),
    ],
    { category: "RAG" },
  ),
  step(
    "agents",
    "AI agents",
    "agents",
    24,
    [
      branch(
        "Agent concepts",
        ["Agent use cases", "ReAct prompting", "Tools and function calling", "Multi-agent systems"],
        "Use an agent when the next action depends on observations. Keep predictable tasks as workflows. Multiple agents introduce handoff, context, cost, and coordination problems; add them only when task decomposition produces a measurable benefit.",
      ),
      branch(
        "Build an agent",
        [
          "Manual implementation",
          "OpenAI AgentKit / Agents SDK",
          "Claude Agent SDK",
          "Vertex AI Agent Builder",
          "Google ADK",
        ],
        "First build a bounded tool loop with application-side authorization and explicit stop conditions. The reference lists several implementation ecosystems; select one if it reduces real orchestration work. Check its current APIs instead of assuming SDKs are interchangeable.",
      ),
    ],
    { category: "AI agents" },
  ),
  step(
    "mcp",
    "Model Context Protocol (MCP)",
    "agents",
    16,
    [
      branch(
        "Core components",
        ["MCP host", "MCP client", "MCP server", "Data layer", "Transport layer"],
        "The host is the application coordinating model use. A client maintains a connection to a server that exposes capabilities. The data layer defines messages and interactions; transport carries them. Keep capability discovery separate from the decision to execute a tool.",
      ),
      branch(
        "Develop with MCP",
        [
          "Build an MCP server",
          "Build an MCP client",
          "Connect to a local server",
          "Connect to a remote server",
        ],
        "Expose one read-only tool, connect a client, inspect its schema, and test its result. Local and remote connections have different deployment and authentication concerns. Validate arguments and user permissions at the service boundary; protocol use does not make tool output trusted.",
      ),
    ],
    {
      category: "AI agents",
      summary: "Connect model applications to tools through explicit client–server interfaces.",
      flow: ["Host application", "MCP client", "MCP server", "Permitted data / tools"],
      example:
        "Expose a policy_search tool from your policy service. The host passes the signed-in user's permitted scope through trusted application logic. Text returned by the tool is evidence, not a new instruction that can override application rules.",
      codeLabel: "Tool contract · illustrative, not an MCP wire message",
      code: 'Tool: policy_search\nInput: {"query": "return unopened item"}\nServer: validate input + apply caller permissions\nResult: [{"source": "policy-7", "text": "..."}]\nHost: use result as untrusted evidence',
      project:
        "Build a read-only policy-search MCP server and connect a client; test a malformed argument, denied access, and a disconnected server.",
      checkpoint:
        "Explain host, client, server, transport, and the location of each permission check.",
    },
  ),
  step(
    "safety",
    "AI safety and ethics",
    "evaluation",
    16,
    [
      branch(
        "Risks to understand",
        ["Prompt injection", "Security and privacy", "Bias and fairness", "AI safety issues"],
        "Document how your system can produce harmful or uneven outcomes, leak information, or misuse tools. Test prompt injection through both user input and retrieved content. Compare performance across relevant input groups rather than relying on one aggregate score.",
      ),
      branch(
        "Safety practices",
        [
          "Content moderation APIs",
          "End-user identifiers",
          "Adversarial testing",
          "Robust prompts",
          "Know users and use cases",
          "Constrain inputs and outputs",
        ],
        "Apply validation and authorization in code, constrain tool capabilities, and test abuse scenarios. Prefer privacy-preserving identifiers in supported request metadata when needed; do not insert personal identifiers into prompts by default. Moderation and prompting supplement these controls.",
      ),
    ],
    {
      category: "Safety",
      summary:
        "Make trust boundaries, privacy, and acceptable behavior explicit from the first prototype.",
      flow: ["Threat model", "Application controls", "Adversarial cases", "Review failures"],
      example:
        "A retrieved document tells the copilot to send all customer records elsewhere. The service should have neither the tool permission nor the data access needed to comply. Test that the answer also ignores the injected instruction.",
      project:
        "Create a threat model and test direct injection, malicious retrieved text, cross-user access, sensitive logging, and unfair classification errors.",
      checkpoint:
        "Identify which controls are enforced by code and show an attack blocked at a trust boundary.",
    },
  ),
  step(
    "observability",
    "LLM observability",
    "production",
    16,
    [
      branch(
        "Observe the system",
        ["Tracing and logging", "Cost and latency monitoring", "Production monitoring"],
        "Trace each retrieval, model call, and tool call under one request ID. Record redacted inputs or references, versions, usage, timing, and failure categories. Watch tail latency and cost per successful task, not only availability.",
      ),
      branch(
        "Observability tools",
        ["LangSmith", "Langfuse", "Helicone", "Arize AI"],
        "Choose a tool after deciding which signals you need. Evaluate tracing support, redaction, retention, hosting, and access controls. A dashboard should help explain a failed request without exposing unnecessary user content.",
      ),
    ],
    { category: "Evaluation and observability" },
  ),
  step(
    "evaluations",
    "LLM evaluations and regression testing",
    "evaluation",
    16,
    [
      branch(
        "Evaluation types",
        [
          "Deterministic evaluations",
          "Model-based evaluations",
          "Human evaluations",
          "Evaluation metrics",
        ],
        "Use exact checks for schema and expected labels, model graders for scalable but imperfect judgments, and human review for nuanced cases. Calibrate automated grades against people and use metrics tied to the user task.",
      ),
      branch(
        "Evaluation tools",
        ["DeepEval", "RAGAS"],
        "These are options for organizing and scoring evaluations. Start with a small versioned dataset and inspect the underlying metric assumptions. A framework score is meaningful only if it predicts the failures you care about.",
      ),
      branch(
        "Regression testing",
        ["Fixed baseline", "Held-out cases", "Release thresholds", "Version comparison"],
        "Run the same representative cases whenever prompts, models, retrieval settings, or tool code change. Keep development examples separate from release evaluation cases. Block regressions according to targets chosen before seeing the candidate's results.",
      ),
    ],
    { category: "Evaluation and observability" },
  ),
  step(
    "multimodal",
    "Multimodal AI",
    "multimodal",
    16,
    [
      branch(
        "Tasks and use cases",
        [
          "Image understanding",
          "Image generation",
          "Video understanding",
          "Audio processing",
          "Text-to-speech",
          "Speech-to-text",
        ],
        "Choose a modality because it helps the user task. Images need visual validation; audio needs transcription and timing checks; video needs temporal sampling. Generated media and extracted content have different evaluation criteria.",
      ),
      branch(
        "Implementation options",
        [
          "OpenAI vision",
          "DALL-E",
          "NanoBanana",
          "Whisper",
          "Hugging Face models",
          "LangChain multimodal apps",
          "LlamaIndex multimodal apps",
        ],
        "These names reflect the reference's tool branches, not a promise that every historical API remains available. Consult current provider documentation for the selected capability and validate file formats, limits, consent, and deployment requirements.",
      ),
    ],
    { category: "Other AI applications" },
  ),
  step(
    "development-tools",
    "Development tools",
    "foundations",
    8,
    [
      branch(
        "AI-assisted coding",
        ["Claude Code", "Gemini", "Codex", "Cursor", "Devin", "Replit", "Vibe coding"],
        "Use one coding assistant to explain code, propose a small change, and help investigate a test failure. Review every diff and run the application. Keep secrets out of shared context and retain responsibility for dependencies, correctness, and tool permissions.",
      ),
    ],
    {
      category: "Other AI applications",
      summary: "Use coding assistance as part of a reviewable engineering workflow.",
      flow: ["Scoped task", "Proposed diff", "Review + tests", "Verified change"],
      example:
        "Ask a coding assistant to add a timeout to the model adapter. Inspect whether it cancels the request, handles the failure, and preserves the response contract. Verify it with a deliberately slow fake provider.",
      codeLabel: "Practice loop",
      code: "1. Describe a small behavior change\n2. Inspect the proposed diff\n3. Test success and failure paths\n4. Verify locally\n5. Commit with a clear explanation",
      project:
        "Use a coding assistant for one small copilot feature and record the changes you accepted, corrected, and rejected.",
      checkpoint:
        "Explain and test the generated code without relying on the assistant's claim that it works.",
    },
  ),
  step(
    "continue-learning",
    "Continue learning",
    "portfolio",
    16,
    [
      branch(
        "Choose a deeper path",
        ["Forward deployed engineering", "Prompt engineering", "AI and data science"],
        "Choose based on your next responsibility: deploying solutions with customers, improving model interactions, or studying data and model development. Finish a demonstrable project before collecting another set of tools.",
      ),
    ],
    { category: "Next steps" },
  ),
];

let elapsedHours = 0;
export const aiEngineerReferenceStages = steps.map((item) => {
  const start = Math.floor(elapsedHours / 8) + 1;
  elapsedHours += item.hours;
  const end = Math.ceil(elapsedHours / 8);
  return { ...item, weeks: start === end ? String(start) : `${start}–${end}` };
});

export const supplementalPractice = [practice.production, practice.portfolio];
