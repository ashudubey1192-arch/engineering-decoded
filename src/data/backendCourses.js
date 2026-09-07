const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const section = (slug, title, lessons) => ({
  slug, title, lessons: lessons.map((title) => ({
    title, slug: `${slug}--${slugify(title)}`, time: "10 min", sectionSlug: slug,
  })),
});
const course = (groups) => groups.map(([slug, title, lessons]) => section(slug, title, lessons));

export const pythonSections = course([
  ["foundations", "Python Foundations", ["Python Setup", "Values and Variables", "Control Flow", "Functions", "Modules and Packages"]],
  ["collections", "Collections", ["Lists and Tuples", "Dictionaries", "Sets", "Comprehensions", "Iterators and Generators"]],
  ["object-oriented", "Object-Oriented Python", ["Classes and Objects", "Inheritance", "Composition", "Data Classes", "Protocols"]],
  ["reliability", "Reliable Python", ["Exceptions", "Context Managers", "Type Hints", "Logging", "Configuration"]],
  ["concurrency", "Concurrency", ["Threads", "Processes", "Asyncio", "Async HTTP", "Concurrency Trade-offs"]],
  ["data-access", "Data Access", ["File IO", "Serialization", "Database Connections", "Transactions", "Repository Pattern"]],
  ["testing", "Testing and Quality", ["Pytest", "Fixtures", "Mocking", "Integration Testing", "Linting and Formatting"]],
  ["production", "Production Python", ["Packaging", "Virtual Environments", "Performance", "Security", "Deployment"]],
]);

export const nodeJsSections = course([
  ["foundations", "Node.js Foundations", ["Node Runtime", "Modules", "Package Management", "Process and Environment", "Debugging"]],
  ["async", "Asynchronous Node.js", ["Event Loop", "Promises", "Async Await", "Event Emitters", "Worker Threads"]],
  ["io", "I/O and Networking", ["File System", "Streams", "Buffers", "HTTP Server", "WebSockets"]],
  ["services", "Building Services", ["Routing", "Middleware", "Validation", "Error Handling", "Configuration"]],
  ["data", "Data and Persistence", ["SQL Access", "NoSQL Access", "Transactions", "Caching", "Migrations"]],
  ["security", "Security", ["Authentication", "Authorization", "Input Security", "Secrets", "Rate Limiting"]],
  ["testing", "Testing", ["Unit Tests", "Integration Tests", "API Tests", "Mocking", "Test Containers"]],
  ["production", "Production Node.js", ["Logging", "Metrics", "Performance", "Scaling", "Deployment"]],
]);

export const goSections = course([
  ["foundations", "Go Foundations", ["Go Toolchain", "Variables and Types", "Control Flow", "Functions", "Packages"]],
  ["data", "Data Structures", ["Arrays and Slices", "Maps", "Structs", "Pointers", "Methods"]],
  ["interfaces", "Interfaces and Design", ["Interfaces", "Composition", "Errors", "Generics", "Dependency Injection"]],
  ["concurrency", "Concurrency", ["Goroutines", "Channels", "Select", "Synchronization", "Context"]],
  ["services", "Web Services", ["HTTP Server", "Routing", "Middleware", "JSON APIs", "Validation"]],
  ["persistence", "Persistence", ["SQL Database", "Transactions", "Repository Pattern", "Caching", "Migrations"]],
  ["testing", "Testing", ["Table Driven Tests", "Mocks and Fakes", "HTTP Tests", "Benchmarks", "Race Detector"]],
  ["production", "Production Go", ["Configuration", "Logging", "Profiling", "Security", "Deployment"]],
]);

export const expressJsSections = course([
  ["foundations", "Express Foundations", ["Creating an Express App", "Routing", "Request and Response", "Middleware", "Project Structure"]],
  ["api", "API Development", ["REST Resources", "Route Parameters", "Query Parameters", "Validation", "Error Responses"]],
  ["data", "Data Layer", ["Database Setup", "Models", "Repositories", "Transactions", "Migrations"]],
  ["security", "Security", ["Authentication", "Authorization", "CORS", "Helmet", "Rate Limiting"]],
  ["advanced", "Advanced Express", ["Async Middleware", "File Uploads", "Streaming", "WebSockets", "Background Jobs"]],
  ["architecture", "Architecture", ["Layered Design", "Dependency Injection", "Configuration", "Domain Services", "Modular Routes"]],
  ["testing", "Testing Express", ["Unit Tests", "API Integration Tests", "Database Tests", "Mocking", "Contract Tests"]],
  ["production", "Production Express", ["Logging", "Monitoring", "Performance", "Scaling", "Deployment"]],
]);

export const fastApiSections = course([
  ["foundations", "FastAPI Foundations", ["Creating an Application", "Path Operations", "Parameters", "Pydantic Models", "Interactive Docs"]],
  ["validation", "Validation and Responses", ["Request Bodies", "Field Validation", "Response Models", "Errors", "Dependency Injection"]],
  ["data", "Data Layer", ["SQL Databases", "ORM Models", "Sessions", "Transactions", "Migrations"]],
  ["security", "Security", ["OAuth2", "JWT", "Authorization", "CORS", "Secrets"]],
  ["async", "Async Features", ["Async Endpoints", "Async Database", "Background Tasks", "WebSockets", "Lifespan Events"]],
  ["architecture", "Architecture", ["Routers", "Service Layer", "Repositories", "Configuration", "Application Factories"]],
  ["testing", "Testing FastAPI", ["Test Client", "Async Tests", "Dependency Overrides", "Database Tests", "API Contracts"]],
  ["production", "Production FastAPI", ["Logging", "Performance", "Workers", "Monitoring", "Deployment"]],
]);

export const djangoSections = course([
  ["foundations", "Django Foundations", ["Creating a Project", "Apps", "Settings", "URLs", "Development Server"]],
  ["models", "Models and Data", ["Model Fields", "Relationships", "QuerySets", "Migrations", "Transactions"]],
  ["web", "Web Layer", ["Views", "Templates", "Forms", "Static Files", "Class Based Views"]],
  ["api", "Django APIs", ["Django REST Framework", "Serializers", "ViewSets", "Validation", "Pagination"]],
  ["security", "Security", ["Authentication", "Permissions", "CSRF", "Session Security", "Secrets"]],
  ["advanced", "Advanced Django", ["Middleware", "Signals", "Caching", "Background Tasks", "File Storage"]],
  ["testing", "Testing Django", ["Model Tests", "View Tests", "API Tests", "Factories", "Database Testing"]],
  ["production", "Production Django", ["Configuration", "Logging", "Performance", "Monitoring", "Deployment"]],
]);

export const restApiSections = course([
  ["foundations", "REST Foundations", ["REST Constraints", "Resources", "HTTP Methods", "Status Codes", "Representations"]],
  ["modeling", "Resource Modeling", ["URI Design", "Relationships", "Collections", "Filtering and Sorting", "Pagination"]],
  ["contracts", "API Contracts", ["Request Design", "Response Design", "Error Models", "OpenAPI", "Compatibility"]],
  ["reliability", "Reliability", ["Idempotency", "Retries", "Timeouts", "Concurrency Control", "Rate Limiting"]],
  ["security", "API Security", ["Authentication", "Authorization", "Input Validation", "CORS", "Threat Modeling"]],
  ["evolution", "API Evolution", ["Versioning", "Deprecation", "Backward Compatibility", "Content Negotiation", "Change Management"]],
  ["testing", "API Testing", ["Unit Tests", "Integration Tests", "Contract Tests", "Load Tests", "Security Tests"]],
  ["production", "Production APIs", ["Documentation", "Observability", "Caching", "Performance", "API Governance"]],
]);

export const graphQlSections = course([
  ["foundations", "GraphQL Foundations", ["GraphQL Model", "Schema Definition", "Queries", "Mutations", "Subscriptions"]],
  ["schema", "Schema Design", ["Object Types", "Interfaces and Unions", "Input Types", "Nullability", "Schema Evolution"]],
  ["server", "GraphQL Server", ["Resolvers", "Context", "Data Sources", "Error Handling", "Custom Scalars"]],
  ["data", "Data Loading", ["N Plus One Problem", "DataLoader", "Pagination", "Caching", "Transactions"]],
  ["security", "Security", ["Authentication", "Field Authorization", "Query Depth", "Complexity Limits", "Persisted Queries"]],
  ["advanced", "Advanced GraphQL", ["Federation", "Schema Stitching", "Directives", "Real Time Updates", "File Uploads"]],
  ["testing", "Testing GraphQL", ["Resolver Tests", "Operation Tests", "Schema Tests", "Contract Tests", "Performance Tests"]],
  ["production", "Production GraphQL", ["Observability", "Performance", "Schema Registry", "Deployment", "Governance"]],
]);

export const authenticationSections = course([
  ["foundations", "Authentication Foundations", ["Identity and Authentication", "Credentials", "Sessions", "Tokens", "Authentication Factors"]],
  ["passwords", "Password Authentication", ["Password Hashing", "Password Policies", "Login Flow", "Password Reset", "Credential Stuffing Defense"]],
  ["sessions", "Sessions and Tokens", ["Cookie Sessions", "JWT", "Refresh Tokens", "Token Rotation", "Revocation"]],
  ["federation", "Federated Identity", ["OAuth Overview", "OpenID Connect", "Single Sign On", "Identity Providers", "Social Login"]],
  ["mfa", "Multi-Factor Authentication", ["TOTP", "SMS Risks", "WebAuthn", "Passkeys", "Recovery Codes"]],
  ["security", "Authentication Security", ["CSRF", "Session Fixation", "Brute Force Defense", "Device Tracking", "Risk Based Authentication"]],
  ["architecture", "Authentication Architecture", ["Identity Service", "Gateway Authentication", "Service Identity", "Multi Tenant Identity", "Audit Events"]],
  ["production", "Production Authentication", ["Secrets and Keys", "Monitoring", "Incident Response", "Testing", "Compliance"]],
]);

export const oauthSections = course([
  ["foundations", "OAuth Foundations", ["OAuth Roles", "Tokens", "Scopes", "Authorization Server", "Resource Server"]],
  ["flows", "Authorization Flows", ["Authorization Code", "PKCE", "Client Credentials", "Device Authorization", "Refresh Tokens"]],
  ["clients", "OAuth Clients", ["Public and Confidential Clients", "Client Registration", "Redirect URIs", "State and Nonce", "Native Applications"]],
  ["tokens", "Token Management", ["Access Tokens", "Refresh Token Rotation", "Token Introspection", "Token Revocation", "JWT Access Tokens"]],
  ["oidc", "OpenID Connect", ["ID Tokens", "UserInfo", "Discovery", "JWKS", "Logout"]],
  ["security", "OAuth Security", ["Authorization Code Interception", "CSRF Defense", "Token Leakage", "Sender Constrained Tokens", "Least Privilege"]],
  ["architecture", "OAuth Architecture", ["API Gateway", "Backend for Frontend", "Service to Service", "Multi Tenant OAuth", "Federation"]],
  ["production", "Production OAuth", ["Key Rotation", "Observability", "Error Handling", "Testing", "Operational Playbooks"]],
]);

export const pythonArticles = pythonSections.flatMap((item) => item.lessons);
export const nodeJsArticles = nodeJsSections.flatMap((item) => item.lessons);
export const goArticles = goSections.flatMap((item) => item.lessons);
export const expressJsArticles = expressJsSections.flatMap((item) => item.lessons);
export const fastApiArticles = fastApiSections.flatMap((item) => item.lessons);
export const djangoArticles = djangoSections.flatMap((item) => item.lessons);
export const restApiArticles = restApiSections.flatMap((item) => item.lessons);
export const graphQlArticles = graphQlSections.flatMap((item) => item.lessons);
export const authenticationArticles = authenticationSections.flatMap((item) => item.lessons);
export const oauthArticles = oauthSections.flatMap((item) => item.lessons);
