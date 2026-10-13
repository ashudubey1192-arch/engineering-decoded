// Independent topic inventory transcribed from the public roadmap on 2026-10-13.
// Used only to verify coverage; lesson prose and examples are independently authored.
export const referenceUrl = 'https://algomaster.io/learn/ai-engineering/course-roadmap';
export const referenceSections = [
  ['Welcome', 'Course Roadmap|Join the Community'],
  ['Introduction to AI Engineering', 'What is AI Engineering?|The Three Layers of the AI Stack|The Modern AI Landscape'],
  ['Python for AI', 'Python Essentials for AI|Functions, Decorators, and Generators|Object-Oriented Python and Dataclasses|Type Hints and Pydantic|Working with Files and Data|Async Python'],
  ['Your First AI Application', 'Making your first LLM API call|Understanding LLM Parameters|Structured Output from LLMs|Streaming and Conversation Management'],
  ['How LLMs Work', 'What are LLMs?|Tokenization|Transformer Architecture Simplified|How LLMs Generate Text|The LLM Training Pipeline'],
  ['Prompt Engineering', 'What is Prompt Engineering?|Anatomy of an Effective Prompt|Advanced Prompting Techniques|Context Engineering|Prompt Templates and Pipelines|Defending Against Prompt Injection|Prompt Optimization and DSPy'],
  ['Embeddings and Vector Search', 'What are Embeddings?|Choosing Embedding Models|Vector Databases|Building a Semantic Search Engine|Scaling Vector Search'],
  ['RAG and Retrieval', 'What is RAG?|Building a Production RAG Pipeline|Advanced Retrieval Techniques|RAG with Citations and Grounding|Evaluating RAG Systems|Conversational RAG|GraphRAG and Knowledge Graphs|Multimodal RAG|Agentic RAG'],
  ['Function Calling and Tool Use', 'From Text Generation to Action|Designing Tool Schemas|Multi-Tool Orchestration|Structured Workflows with Tool Use'],
  ['Model Context Protocol (MCP)', 'What is MCP?|Building MCP Clients|Remote MCP Servers|Production MCP Server Patterns'],
  ['Building AI Agents', 'What are AI Agents?|Agent Memory Systems|Multi-Agent Systems|Agent Frameworks|Agent Reliability and Debugging|Agent Evaluation and Testing|Human-in-the-Loop Patterns|Building AI Workflows'],
  ['AI System Architecture', 'Architecture Patterns for AI Applications|Designing for Reliability|Data Architecture for AI|Scaling AI Applications|The AI Gateway Pattern|Building AI-Powered UX|Caching Strategies for LLM Applications|Rate Limiting and API Management'],
  ['Production Deployment', 'Containerizing AI Applications|CI/CD for AI Applications|Monitoring and Observability|Handling Production Incidents|Iterating in Production|The AI Engineering Lifecycle'],
  ['LLM Optimization', 'Understanding AI Application Costs|Prompt Optimization|Model Selection and Routing|Latency Optimization|Self-Hosting Models'],
  ['Agentic AI', 'Computer Use Agents|Coding Agents|Deep Research Agents|Agent Protocols|Long-Running and Async Agents|Agent Sandboxing and Security'],
  ['Multimodal and Generative AI', 'Vision Models and Image Understanding|Text-to-Image Generation|Audio and Speech Generation|Video Understanding and Generation|Building Multimodal Applications'],
].map(([title, topics]) => ({ title, topics: topics.split('|') }));
