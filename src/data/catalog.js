export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const tracks = (value) =>
  value.split(",").map((name) => ({ name: name.trim(), slug: slugify(name.trim()) }));
const makeModule = (id, name, icon, accent, description, groups) => ({
  id,
  name,
  icon,
  accent,
  description,
  groups,
});

export const modules = [
  
  makeModule(
    "architecture",
    "System Design and Architecture",
    "SD",
    "#f27d63",
    "Reason about scale, reliability, boundaries, and trade-offs.",
    [
      {
        name: "System design",
        tracks: tracks("System Design Fundamentals, High Level Design, Low Level Design"),
      },
      {
        name: "Architecture",
        tracks: tracks("Microservices, Clean Architecture, Design Patterns, DDD"),
      },
    ],
  ),
  makeModule(
    "frontend",
    "Frontend Engineering",
    "FE",
    "#ff7657",
    "Create accessible, fast, production-ready interfaces.",
    [
      { name: "Core web", tracks: tracks("HTML, CSS, JavaScript, TypeScript") },
      { name: "Frameworks", tracks: tracks("React, Angular, Vue, Next.js") },
      { name: "UI and tooling", tracks: tracks("Tailwind CSS, Material UI, Redux, Vite") },
    ],
  ),
  makeModule(
    "backend",
    "Backend Engineering",
    "BE",
    "#c9f85b",
    "Design APIs, services, security, and business systems.",
    [
      { name: "Languages", tracks: tracks("Java, Python, Node.js, Go") },
      { name: "Frameworks", tracks: tracks("Spring Boot, Express.js, FastAPI, Django") },
      { name: "API engineering", tracks: tracks("REST API, GraphQL, Authentication, OAuth") },
    ],
  ),
  makeModule(
    "databases",
    "Database Engineering",
    "DB",
    "#68b7ed",
    "Model, query, scale, and operate reliable data systems.",
    [
      { name: "RDBMS", tracks: tracks("SQL, PostgreSQL, MySQL, Oracle, Transactions") },
      { name: "NoSQL Databases", tracks: tracks("MongoDB, Cassandra, Redis, InfluxDB") },
      {
        name: "Hybrid Databases",
        tracks: tracks(
          "Hybrid Database Fundamentals, Distributed SQL, Multi-model Databases, HTAP Databases",
        ),
      },
      {
        name: "Vector Databases",
        tracks: tracks("Vector Database Fundamentals, Pinecone, Milvus, Weaviate, Chroma"),
      },
      { name: "Scaling", tracks: tracks("Indexing, Replication, Sharding, Partitioning") },
    ],
  ),
  makeModule(
    "messaging",
    "Messaging and Event Streaming",
    "MQ",
    "#f5b84b",
    "Build asynchronous systems with queues, streams, and events.",
    [
      { name: "Platforms", tracks: tracks("Kafka, RabbitMQ, Solace, Event Streaming") },
      {
        name: "Patterns",
        tracks: tracks("Pub Sub, Dead Letter Queue, Idempotency, Outbox Pattern"),
      },
    ],
  ),
  makeModule(
    "dsa",
    "Data Structures and Algorithms",
    "DS",
    "#a88af4",
    "Build strong problem-solving and interview foundations.",
    [
      { name: "Structures", tracks: tracks("Arrays, Linked Lists, Trees, Graphs") },
      {
        name: "Algorithms",
        tracks: tracks("Binary Search, Dynamic Programming, Greedy, Backtracking"),
      },
    ],
  ),
  makeModule(
    "coding-patterns",
    "Coding Patterns and Problem Solving",
    "CP",
    "#c18cff",
    "Recognize reusable patterns and solve coding problems systematically.",
    [
      {
        name: "Core patterns",
        tracks: tracks("Two Pointers, Sliding Window, Prefix Sum, Recursion"),
      },
      {
        name: "Advanced patterns",
        tracks: tracks("Divide and Conquer, Bit Manipulation, Concurrency Patterns, OOP Patterns"),
      },
    ],
  ),
  makeModule(
    "devops",
    "DevOps and Platform Engineering",
    "DO",
    "#6fd1b3",
    "Automate delivery, infrastructure, and operations.",
    [
      { name: "Containers", tracks: tracks("Docker, Kubernetes, Helm, OpenShift") },
      { name: "Delivery", tracks: tracks("Terraform, Jenkins, GitHub Actions, Ansible") },
    ],
  ),
  makeModule(
    "cloud",
    "Cloud Engineering",
    "CL",
    "#76a9ff",
    "Architect secure and scalable cloud services.",
    [{ name: "Platforms", tracks: tracks("AWS, Azure, Google Cloud, Serverless") }],
  ),
  makeModule(
    "ai",
    "AI, ML and Data Science",
    "AI",
    "#b491ff",
    "Build intelligent products with data and language models.",
    [
      {
        name: "Foundations",
        tracks: tracks("Machine Learning, Deep Learning, Data Science, Python"),
      },
      { name: "Generative AI", tracks: tracks("LLMs, Prompt Engineering, RAG, AI Agents") },
    ],
  ),
  makeModule(
    "communication",
    "Engineering Communication",
    "CS",
    "#f5c56b",
    "Communicate technical ideas clearly across teams and audiences.",
    [
      {
        name: "Core skills",
        tracks: tracks(
          "Technical Writing, Presentation Skills, Listening Skills, Stakeholder Communication",
        ),
      },
      {
        name: "Workplace communication",
        tracks: tracks("Corporate Vocabulary, Documentation, Feedback, Negotiation"),
      },
    ],
  ),
  makeModule(
    "leadership",
    "Engineering Leadership and Management",
    "LM",
    "#70d3a8",
    "Lead teams, projects, delivery, and technical decisions with confidence.",
    [
      {
        name: "Leadership",
        tracks: tracks(
          "Team Leadership, Engineering Management, Requirement Gathering, Project Management",
        ),
      },
      { name: "Ways of working", tracks: tracks("Agile, Scrum, Kanban, Jira") },
    ],
  ),
  makeModule(
    "frontend-tooling",
    "Frontend Tools and Libraries",
    "FT",
    "#ff9775",
    "Master the build tools, package managers, and libraries used by frontend teams.",
    [
      { name: "Package and build", tracks: tracks("npm, yarn, pnpm, Webpack") },
      { name: "Quality and UI", tracks: tracks("Vite, Babel, Storybook, ESLint") },
    ],
  ),
  makeModule(
    "backend-tooling",
    "Backend Tools and Libraries",
    "BT",
    "#b9ed68",
    "Use essential backend libraries for persistence, APIs, caching, and builds.",
    [
      { name: "Persistence and APIs", tracks: tracks("Hibernate, JPA, Swagger, OpenAPI") },
      { name: "Caching and builds", tracks: tracks("Caffeine, Guava Cache, Maven, Gradle") },
    ],
  ),
  makeModule(
    "developer-tools",
    "Developer Productivity Tools",
    "DT",
    "#74b8f2",
    "Configure an efficient daily development environment and workflow.",
    [
      {
        name: "Editors and source control",
        tracks: tracks("IntelliJ IDEA, VS Code, Eclipse, Git"),
      },
      {
        name: "Platforms and assistants",
        tracks: tracks("GitHub, GitLab, Browser DevTools, AI Coding Tools"),
      },
    ],
  ),
  makeModule(
    "misc-tools",
    "Collaboration and Miscellaneous Tools",
    "MT",
    "#a5a8b3",
    "Learn the supporting tools used across modern engineering organizations.",
    [
      { name: "Collaboration", tracks: tracks("Notion, Confluence, Slack, Teams") },
      {
        name: "Utilities",
        tracks: tracks("Postman, PowerShell, Shell Scripting, Microsoft Office"),
      },
    ],
  ),
  makeModule(
    "testing",
    "Testing and Quality Engineering",
    "QA",
    "#ff728d",
    "Build confidence with a balanced testing strategy.",
    [
      {
        name: "Testing",
        tracks: tracks("Unit Testing, Integration Testing, API Testing, Playwright"),
      },
    ],
  ),
  makeModule(
    "interviews",
    "Interview Preparation",
    "IP",
    "#ff6f61",
    "Prepare by language, framework, and interview round.",
    [
      {
        name: "Technical",
        tracks: tracks(
          "Java Interview, React Interview, Python Interview, System Design Interview",
        ),
      },
      {
        name: "People",
        tracks: tracks("Behavioral Interview, Leadership Interview, HR Interview"),
      },
    ],
  ),
  makeModule(
    "mock-interviews",
    "Mock Interviews",
    "MI",
    "#fb7f72",
    "Practice realistic interview rounds and improve with structured feedback.",
    [
      {
        name: "Practice rounds",
        tracks: tracks(
          "Java Mock Interview, React Mock Interview, Python Mock Interview, System Design Mock Interview",
        ),
      },
      {
        name: "People rounds",
        tracks: tracks("Behavioral Mock Interview, Leadership Mock Interview"),
      },
    ],
  ),
  makeModule(
    "roadmaps",
    "Career Roadmaps",
    "RM",
    "#8f9cff",
    "Follow progressive role and skill learning plans.",
    [
      {
        name: "Roles",
        tracks: tracks("Frontend Roadmap, Backend Roadmap, DevOps Roadmap, AI Engineer Roadmap"),
      },
    ],
  ),
  makeModule(
    "career",
    "Career Growth",
    "CG",
    "#60c7b0",
    "Improve your resume, portfolio, job search, and leadership.",
    [
      {
        name: "Career",
        tracks: tracks("Resume Builder, Job Search, LinkedIn Profile, Technical Leadership"),
      },
    ],
  ),
  makeModule(
    "blogs",
    "Technical Blogging and Content",
    "BL",
    "#de8cf0",
    "Plan, write, publish, and grow high-quality technical content.",
    [
      {
        name: "Writing",
        tracks: tracks(
          "Technical Blogging, Content Planning, Markdown and MDX, Technical Diagrams",
        ),
      },
      {
        name: "Publishing",
        tracks: tracks("Newsletter, RSS Feed, YouTube Content, Content Analytics"),
      },
    ],
  ),
  makeModule(
    "marketing",
    "Digital Marketing and SEO",
    "DM",
    "#ef9b58",
    "Grow technical content and products with measurable marketing.",
    [
      {
        name: "Marketing",
        tracks: tracks("SEO, Content Marketing, Google Analytics, Email Marketing"),
      },
    ],
  ),
  makeModule(
    "video",
    "Video Editing and Content",
    "VE",
    "#e979d7",
    "Create engaging technical videos and tutorials.",
    [{ name: "Tools", tracks: tracks("DaVinci Resolve, Premiere Pro, CapCut, YouTube Strategy") }],
  ),
  makeModule(
    "wellbeing",
    "Developer Wellbeing",
    "WB",
    "#79d6a3",
    "Build sustainable habits for energy, mobility, focus, and long-term health.",
    [
      { name: "Movement", tracks: tracks("Home Workout, Bodyweight Workout, Stretching, Yoga") },
      {
        name: "Mind and nutrition",
        tracks: tracks("Pranayama, Meditation, Nutrition, Healthy Developer Habits"),
      },
    ],
  ),
];

export const articleTemplates = [
  { slug: "introduction", title: "Introduction and learning goals", time: "8 min" },
  { slug: "core-concepts", title: "Core concepts and mental models", time: "14 min" },
  { slug: "architecture", title: "Architecture and lifecycle", time: "16 min" },
  { slug: "practical-guide", title: "Build a practical project", time: "22 min" },
  { slug: "best-practices", title: "Best practices and common mistakes", time: "12 min" },
  { slug: "interview-questions", title: "Interview questions and answers", time: "18 min" },
];

export const getModule = (id) => modules.find((module) => module.id === id);
export const getTrack = (module, slug) =>
  module?.groups.flatMap((group) => group.tracks).find((track) => track.slug === slug);
export const findTrack = (slug) =>
  modules
    .flatMap((module) =>
      module.groups.flatMap((group) => group.tracks.map((track) => ({ module, track }))),
    )
    .find((item) => item.track.slug === slug);
