import { modules } from "./catalog.js";

const completedModules = new Set([
  "architecture",
  "frontend",
  "backend",
  "databases",
  "messaging",
  "dsa",
  "coding-patterns",
  "social-media",
]);

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((lesson) => ({
    title: lesson,
    slug: `${slug}--${slugify(lesson)}`,
    time: "10 min",
    sectionSlug: slug,
  })),
});

// Course blueprints are organized by catalog group so every generated course
// receives lessons for its subject area instead of generic placeholder topics.
const blueprints = {
  "ai/Foundations": [
    ["Foundations", ["Problem Types and Learning Tasks", "Datasets, Features, and Labels", "Training, Validation, and Test Sets", "A Practical Workflow for {{course}}"]],
    ["Core Methods", ["Choose a Baseline Model", "Loss Functions and Optimization", "Generalization and Overfitting", "Feature and Data Quality"]],
    ["Build and Evaluate", ["Prepare a Reproducible Experiment", "Train a First Model", "Select Metrics for the Problem", "Analyze Errors and Improve Results"]],
    ["Advanced Practice", ["Regularization and Model Selection", "Imbalanced Data and Calibration", "Interpretability and Model Limits", "Efficiency, Scale, and Compute"]],
    ["Applied Work", ["Design an End-to-End Project", "Avoid Leakage and Invalid Comparisons", "Document Results and Assumptions", "Review a Real-World Failure Mode"]],
    ["Production and Mastery", ["Deploy and Version a Model", "Monitor Data and Model Drift", "Privacy, Fairness, and Responsible Use", "{{course}} Practice Questions"]],
  ],
  "ai/Generative AI": [
    ["Foundations", ["How {{course}} Systems Work", "Choose Models for a Task", "Tokens, Context, and Model Limits", "Hosted Models and Open-Weight Models"]],
    ["Core Techniques", ["Prompt Structure and Instruction Following", "Structured Outputs and Schema Validation", "Context Management and Conversation State", "Sampling Controls and Response Variability"]],
    ["Build an Application", ["Design the Request and Response Flow", "Connect a Model API Safely", "Add Retrieval or Tools When Needed", "Handle Timeouts, Retries, and Errors"]],
    ["Quality and Safety", ["Create an Evaluation Dataset", "Measure Quality with Human and Automated Review", "Prompt Injection and Untrusted Input", "Privacy, Guardrails, and Refusal Behavior"]],
    ["Production", ["Manage Latency, Cost, and Rate Limits", "Logging, Tracing, and Versioning", "Monitor Regressions after Model Changes", "Ship a Maintainable {{course}} Feature"]],
  ],
  "cloud/Platforms": [
    ["Cloud Foundations", ["Regions, Zones, and Global Infrastructure", "Accounts, Projects, and Resource Hierarchy", "Identity, Roles, and Least Privilege", "Networking and Virtual Networks"]],
    ["Compute and Storage", ["Virtual Machines and Images", "Object, Block, and File Storage", "Managed Databases and Backups", "Load Balancers and Autoscaling"]],
    ["Design and Build", ["Choose Managed Services for a Workload", "Deploy a Secure Web Application", "Infrastructure as Code and Environments", "Secrets, Configuration, and Key Management"]],
    ["Reliability and Cost", ["Availability, Recovery, and Failure Domains", "Scaling and Capacity Planning", "Budgets, Pricing, and Cost Controls", "Observability and Operational Alerts"]],
    ["Production Operations", ["Network and Workload Security", "Backup and Disaster Recovery", "Safe Releases and Rollbacks", "Review a Production Architecture"]],
  ],
  "cloud/Serverless": [
    ["Serverless Foundations", ["Functions, Events, and Managed Services", "Execution Lifecycles and Runtime Limits", "Identity, Permissions, and Secrets", "When Serverless Fits a Workload"]],
    ["Event-Driven Design", ["Triggers, Queues, and Event Routing", "Payloads, Schemas, and Versioning", "Retries, Timeouts, and Dead-Letter Handling", "Idempotency for At-Least-Once Delivery"]],
    ["Build and Deploy", ["Create a Small Function-Based Service", "Connect Functions to Storage and APIs", "Manage Environments and Configuration", "Automate Deployment and Rollback"]],
    ["Scale and Reliability", ["Concurrency, Cold Starts, and Limits", "Observability across Asynchronous Flows", "Failure Isolation and Recovery", "Cost and Performance Tuning"]],
    ["Production", ["Secure Events and Service Integrations", "Test Functions and Event Contracts", "Plan for Provider Limits and Lock-In", "Review a Serverless Architecture"]],
  ],
  "devops/Containers": [
    ["Container Foundations", ["Images, Containers, and Registries", "Build Reproducible and Small Images", "Container Networking and Persistent Data", "Configuration, Secrets, and Environment Variables"]],
    ["Orchestration", ["Workloads, Services, and Scheduling", "Deployments, Scaling, and Rollouts", "Configuration and Secret Management", "Storage and Network Policies"]],
    ["Package and Release", ["Package Reusable Deployment Resources", "Manage Values and Environment Overrides", "Promote Releases through Environments", "Roll Back a Failed Release"]],
    ["Operate the Platform", ["Health Checks and Resource Requests", "Logs, Metrics, and Distributed Traces", "Troubleshoot Scheduling and Networking", "Plan Capacity and Control Costs"]],
    ["Production Readiness", ["Secure Images and Cluster Access", "Upgrade Workloads with Minimal Disruption", "Backup, Recovery, and Availability", "Review a Container Platform Design"]],
  ],
  "devops/Delivery": [
    ["Delivery Foundations", ["Version Control and Delivery Pipelines", "Build Artifacts and Manage Dependencies", "Environments, Variables, and Secrets", "Plan a Repeatable Release Process"]],
    ["Infrastructure and Automation", ["Describe Infrastructure as Code", "Manage State, Modules, and Environments", "Automate Configuration and Drift Checks", "Review Changes before Applying Them"]],
    ["Build a Pipeline", ["Compile, Lint, and Test on Every Change", "Publish and Sign Build Artifacts", "Deploy through Staged Environments", "Add Approval and Rollback Controls"]],
    ["Reliability and Security", ["Pipeline Permissions and Supply-Chain Risks", "Deployment Strategies and Health Gates", "Handle Failed Jobs and Partial Releases", "Observe Delivery Frequency and Failure"]],
    ["Platform Practice", ["Reuse Pipeline Templates Safely", "Manage Credentials and Runner Capacity", "Design a Release for Multiple Services", "Improve a Slow or Unreliable Pipeline"]],
  ],
  "backend-tooling/Persistence and APIs": [
    ["Library Foundations", ["The Problem {{course}} Solves", "Core Abstractions and Runtime Lifecycle", "Configure a Minimal Application", "Understand Defaults and Extension Points"]],
    ["Everyday Use", ["Model Inputs, Outputs, and Domain Types", "Configure the Main Integration", "Handle Errors and Boundary Conditions", "Build a Focused Feature"]],
    ["Integration Design", ["Connect {{course}} to Application Layers", "Transactions, Validation, and Data Flow", "Document Contracts and Compatibility", "Manage Configuration across Environments"]],
    ["Quality and Performance", ["Test Behavior at the Right Boundary", "Diagnose Common Integration Failures", "Measure Performance before Tuning", "Security and Dependency Maintenance"]],
    ["Production Practice", ["Version and Upgrade Dependencies", "Logging, Metrics, and Operational Signals", "Choose Safe Defaults for Production", "Review a Maintainable Integration"]],
  ],
  "backend-tooling/Backend → Caching": [
    ["Caching Foundations", ["Cache-Aside, Read-Through, and Write-Through", "Keys, Values, and Expiration", "Choose Data to Cache", "Cache Hit Rate and Staleness"]],
    ["Use and Integrate", ["Add a Cache to a Read Path", "Serialize Values and Manage Schemas", "Invalidate after Writes", "Handle Cache Misses and Failures"]],
    ["Consistency and Scale", ["TTL, Eviction, and Memory Limits", "Stampedes, Hot Keys, and Thundering Herds", "Local and Distributed Cache Trade-Offs", "Coordinate Cache and Database Behavior"]],
    ["Operations and Security", ["Observe Hit Rate, Latency, and Memory", "Protect Sensitive Values and Access", "Test Expiry and Invalidation", "Tune Capacity and Eviction Policies"]],
    ["Production Design", ["Degrade Gracefully without the Cache", "Plan for Recovery and Cache Warmup", "Review a Cache Failure Scenario", "Design a Safe Caching Strategy"]],
  ],
  "backend-tooling/Infrastructure → Distributed Cache": [
    ["Distributed Cache Foundations", ["Nodes, Replication, and Cluster Topology", "Keys, Data Types, and Expiration", "Consistency and Availability Trade-Offs", "Connect an Application Client"]],
    ["Data and Access Patterns", ["Choose Data Structures for Access Patterns", "Atomic Operations and Transactions", "Partitioning and Key Distribution", "Design for Hot Keys and Large Values"]],
    ["Reliability and Performance", ["Replication, Failover, and Persistence", "Timeouts, Retries, and Connection Pools", "Memory Policies and Eviction", "Benchmark Latency and Throughput"]],
    ["Security and Operations", ["Authentication, Network Boundaries, and TLS", "Monitor Memory, Connections, and Replication", "Backup, Restore, and Data Durability", "Troubleshoot Slow or Failed Requests"]],
    ["Production Design", ["Cache Failure and Application Degradation", "Capacity Planning and Cost", "Upgrade and Migration Planning", "Review a Distributed Cache Architecture"]],
  ],
  "backend-tooling/Database": [
    ["Database Foundations", ["Relational Data and Query Processing", "Tables, Keys, and Constraints", "Transactions and Isolation", "Connect an Application to {{course}}"]],
    ["Model and Query", ["Design a Schema for an Application", "Write Queries and Use Parameters Safely", "Indexes and Query Plans", "Migrations and Schema Evolution"]],
    ["Application Integration", ["Connection Pools and Transaction Boundaries", "Repositories and Data Access Patterns", "Pagination and Batch Operations", "Handle Timeouts and Database Errors"]],
    ["Operations", ["Backups, Restore, and Recovery", "Roles, Permissions, and Data Protection", "Monitor Connections and Query Latency", "Diagnose Locks and Slow Queries"]],
    ["Production Practice", ["Plan Migrations with Rollback", "Capacity, Replication, and Availability", "Test Data Access under Load", "Review a Production Database Design"]],
  ],
  "backend-tooling/Build tools": [
    ["Build Tool Foundations", ["Projects, Tasks, and Build Lifecycles", "Dependencies, Repositories, and Versioning", "Configure Plugins and Build Properties", "Run and Inspect a Build"]],
    ["Everyday Workflow", ["Compile, Test, and Package an Application", "Manage Dependency Scopes and Conflicts", "Use Tasks, Goals, and Build Profiles", "Create Reusable Build Configuration"]],
    ["Build Quality", ["Lock and Audit Dependencies", "Run Checks Consistently in CI", "Diagnose Resolution and Compilation Failures", "Keep Builds Reproducible"]],
    ["Performance and Release", ["Parallel, Incremental, and Cached Builds", "Package and Publish Artifacts", "Manage Multi-Module Projects", "Upgrade Plugins and Build Versions"]],
    ["Team Practice", ["Secure Credentials and Repository Access", "Standardize Builds across Developers", "Measure Build Time and Reliability", "Design a Maintainable Build Pipeline"]],
  ],
  "frontend-tooling/Package and build": [
    ["Tooling Foundations", ["Packages, Modules, and Dependency Graphs", "Project Scripts and Build Configuration", "Development and Production Builds", "Choose a Tool for a Frontend Project"]],
    ["Application Workflow", ["Install and Update Dependencies Safely", "Bundle, Transform, and Split Code", "Configure Environment Variables and Assets", "Set Up a Fast Local Development Loop"]],
    ["Build Quality", ["Resolve Version and Dependency Conflicts", "Analyze Bundle Size and Output", "Test Production Builds and Source Maps", "Keep Lockfiles and Builds Reproducible"]],
    ["Advanced Build Design", ["Configure Plugins and Compiler Transforms", "Optimize Caching and Incremental Builds", "Support Multiple Environments", "Migrate Build Configuration Safely"]],
    ["Production Workflow", ["Integrate Builds with Continuous Delivery", "Protect Secrets and Supply Chain", "Debug Build Failures in CI", "Maintain a Frontend Toolchain"]],
  ],
  "frontend-tooling/Quality and UI": [
    ["Tool Foundations", ["The Role of {{course}} in a Frontend Workflow", "Install and Configure a Project", "Core Concepts and Configuration Model", "Choose a Consistent Team Setup"]],
    ["Everyday Use", ["Apply the Main Workflow to a Feature", "Organize Components and Shared Rules", "Create Reusable Configuration", "Connect the Tool to an Existing App"]],
    ["Quality and Collaboration", ["Validate Changes during Development", "Document and Share UI Behavior", "Catch Accessibility and Consistency Issues", "Integrate Checks into Pull Requests"]],
    ["Troubleshooting and Scale", ["Diagnose Configuration and Runtime Problems", "Keep Feedback Fast in Large Projects", "Manage Versions and Breaking Changes", "Extend Defaults without Excess Complexity"]],
    ["Production Practice", ["Establish Team Conventions", "Review Maintainability and Accessibility", "Measure Workflow Improvements", "Plan a Safe Upgrade"]],
  ],
  "testing/Testing": [
    ["Testing Foundations", ["Risk, Confidence, and the Test Pyramid", "Test Boundaries and Test Doubles", "Arrange, Act, and Assert Clearly", "Choose Cases from Requirements"]],
    ["Write Useful Tests", ["Test Success, Failure, and Boundary Cases", "Isolate External Dependencies", "Control Time, Data, and Randomness", "Keep Tests Readable and Deterministic"]],
    ["Test System Behavior", ["Contract and Integration Coverage", "Fixtures, Factories, and Test Environments", "Browser Flows and User Journeys", "Validate APIs and Asynchronous Work"]],
    ["Reliable Test Suites", ["Diagnose Flaky and Slow Tests", "Parallel Execution and Test Isolation", "Coverage Gaps and Mutation Thinking", "Run Tests in Continuous Integration"]],
    ["Quality Practice", ["Prioritize Tests by Risk", "Report Failures with Useful Evidence", "Protect Secrets and Test Data", "Build a Sustainable Quality Strategy"]],
  ],
  "mobile/Mobile frameworks and stacks": [
    ["Mobile Foundations", ["Application Structure and Platform Lifecycle", "Layouts, Navigation, and User Input", "State, Persistence, and Network Access", "Platform Permissions and Device Features"]],
    ["Build an Application", ["Create Screens and Reusable UI", "Manage Application and Screen State", "Call APIs and Handle Offline Conditions", "Adapt Layouts to Devices and Accessibility"]],
    ["Platform Integration", ["Navigation, Deep Links, and Notifications", "Device Storage and Secure Data", "Background Work and Lifecycle Changes", "Share Code across Platforms Responsibly"]],
    ["Quality and Performance", ["Test UI, State, and Device Behavior", "Profile Startup, Rendering, and Memory", "Handle Crashes and Network Failures", "Automate Builds for Target Platforms"]],
    ["Release and Operations", ["Signing, Builds, and Store Readiness", "Protect User Data and Permissions", "Monitor Crashes and App Health", "Plan Compatibility and Application Updates"]],
  ],
  "desktop/Desktop frameworks and stacks": [
    ["Desktop Foundations", ["Application Process and Window Lifecycle", "Menus, Navigation, and Native UI", "Local Files, Settings, and Persistence", "Platform Integration and Permissions"]],
    ["Build an Application", ["Create Windows and Reusable Views", "Manage State and Background Work", "Handle Files, Imports, and Exports", "Package a Small Desktop Feature"]],
    ["Native Integration", ["Notifications, Shortcuts, and System APIs", "Secure Storage and User Data", "Cross-Platform Differences and Capabilities", "Design Accessible Keyboard Workflows"]],
    ["Quality and Performance", ["Test UI and Platform-Specific Behavior", "Profile Startup, Rendering, and Memory", "Recover from Crashes and Interrupted Work", "Automate Platform Builds"]],
    ["Release and Maintenance", ["Signing, Packaging, and Updates", "Protect Local Data and Application Secrets", "Collect Diagnostics with User Consent", "Maintain Compatibility across Releases"]],
  ],
  "developer-tools/Editors and source control": [
    ["Workspace Foundations", ["Projects, Workspaces, and Editor Configuration", "Search, Navigation, and Refactoring", "Version Control Concepts and Repository Setup", "Configure a Productive Daily Environment"]],
    ["Core Workflow", ["Make Focused Changes and Review Diffs", "Branch, Commit, and Synchronize Work", "Resolve Merge Conflicts Safely", "Use Debugging and Inspection Tools"]],
    ["Team Collaboration", ["Write Useful Commits and Pull Requests", "Review Changes and Leave Actionable Feedback", "Share Configuration without Machine-Specific Settings", "Protect Branches and Repository Access"]],
    ["Efficiency and Recovery", ["Automate Repeated Editor Tasks", "Recover from Mistakes with History", "Diagnose Indexing and Performance Problems", "Keep Tools and Extensions Maintainable"]],
    ["Professional Practice", ["Secure Credentials and Local Configuration", "Use Reviews to Improve Code Quality", "Create a Reproducible Developer Setup", "Improve the Team's Source Control Workflow"]],
  ],
  "developer-tools/Platforms and assistants": [
    ["Tool Foundations", ["Where {{course}} Fits in Software Development", "Configure Projects and Access", "Understand the Core Interaction Model", "Connect the Tool to a Real Workflow"]],
    ["Daily Workflow", ["Find, Inspect, and Change Project Information", "Use Automation and Integrations", "Share Work with Teammates", "Keep Changes Reviewable and Reversible"]],
    ["Quality and Security", ["Verify Outputs before Acting on Them", "Manage Permissions and Sensitive Data", "Understand Limits, Errors, and Stale Context", "Audit Activity and Configuration"]],
    ["Team Adoption", ["Define Usage Conventions and Ownership", "Integrate with Existing Development Tools", "Measure Time Saved and Workflow Quality", "Troubleshoot Common Adoption Problems"]],
    ["Responsible Practice", ["Protect Source Code and Credentials", "Review Automated Suggestions and Changes", "Plan Access and Lifecycle Management", "Build a Sustainable Team Workflow"]],
  ],
  "communication/Core skills": [
    ["Communication Foundations", ["Identify Audience, Purpose, and Desired Outcome", "Separate Evidence, Interpretation, and Opinion", "Ask Clear Questions and Confirm Understanding", "Choose the Right Channel and Level of Detail"]],
    ["Explain Technical Work", ["Structure a Clear Technical Explanation", "Use Examples, Diagrams, and Plain Language", "Present Options with Constraints and Trade-Offs", "Adapt Detail for Different Audiences"]],
    ["Listen and Collaborate", ["Listen for Needs and Unspoken Assumptions", "Summarize Decisions and Open Questions", "Give Specific, Respectful Feedback", "Handle Disagreement with Shared Evidence"]],
    ["Practice and Improve", ["Prepare for a Difficult Conversation", "Communicate Risk and Uncertainty", "Facilitate an Inclusive Discussion", "Review and Improve Your Communication"]],
    ["Workplace Application", ["Write an Actionable Status Update", "Present a Proposal and Invite Review", "Document Decisions and Ownership", "Build Trust through Follow-Through"]],
  ],
  "communication/Workplace communication": [
    ["Workplace Foundations", ["Purpose, Audience, and Communication Norms", "Clear Writing for Technical Teams", "Context, Decisions, and Action Items", "Choose Synchronous or Asynchronous Communication"]],
    ["Everyday Collaboration", ["Write Useful Updates and Handoffs", "Document Work for Future Readers", "Give Feedback that Can Be Acted On", "Ask for and Confirm Commitments"]],
    ["Alignment and Negotiation", ["Understand Needs and Constraints", "Prepare Options and a Negotiable Scope", "Resolve Disagreement without Losing the Goal", "Record Agreements and Remaining Risks"]],
    ["Difficult Situations", ["Raise Concerns Early and Constructively", "Respond to Feedback with Curiosity", "Communicate Delays and Changing Plans", "Repair Misunderstandings"]],
    ["Professional Practice", ["Build Credibility through Reliable Follow-Up", "Communicate across Roles and Time Zones", "Protect Confidential Information", "Create Better Team Communication Habits"]],
  ],
  "leadership/Leadership": [
    ["Leadership Foundations", ["Move from Individual Contribution to Team Outcomes", "Set Direction, Context, and Expectations", "Build Trust and Psychological Safety", "Understand Motivation and Team Strengths"]],
    ["Lead People and Work", ["Delegate Outcomes with Clear Ownership", "Coach through Questions and Feedback", "Run Useful One-on-Ones and Team Meetings", "Support Growth and Career Development"]],
    ["Technical Decisions", ["Facilitate Decisions with Incomplete Information", "Balance Delivery, Quality, and Technical Risk", "Resolve Conflict and Align Stakeholders", "Communicate Decisions and Trade-Offs"]],
    ["Delivery and Change", ["Plan Work and Manage Dependencies", "Respond to Incidents and Setbacks", "Lead Change with Clear Communication", "Measure Team Health and Delivery Outcomes"]],
    ["Sustainable Leadership", ["Build Inclusive and Accountable Teams", "Address Performance Concerns Fairly", "Develop Future Leaders", "Reflect and Improve Your Leadership Practice"]],
  ],
  "leadership/Ways of working": [
    ["Ways of Working Foundations", ["Principles, Roles, and Team Agreements", "Plan Work in Small, Reviewable Increments", "Make Work Visible and Manage Flow", "Choose a Process that Fits the Team"]],
    ["Plan and Coordinate", ["Break Goals into Outcomes and Tasks", "Estimate with Uncertainty and Dependencies", "Prioritize Work and Manage Scope", "Coordinate Ownership across a Team"]],
    ["Delivery Rhythm", ["Facilitate Planning and Review Sessions", "Manage Blockers and Work in Progress", "Track Decisions, Risks, and Follow-Up", "Adapt Plans from Delivery Evidence"]],
    ["Improve the System", ["Use Retrospectives to Find Small Improvements", "Recognize Bottlenecks and Rework", "Respond to Changing Requirements", "Measure Flow without Gaming Metrics"]],
    ["Apply and Adapt", ["Handle Interruptions and Urgent Work", "Coordinate across Teams and Stakeholders", "Improve a Real Team Workflow", "Select Practices for the Next Delivery Cycle"]],
  ],
  "misc-tools/Collaboration": [
    ["Workspace Foundations", ["Spaces, Pages, Channels, and Permissions", "Organize Information around Team Work", "Search and Find the Current Source of Truth", "Set Up a Useful Collaboration Workflow"]],
    ["Daily Collaboration", ["Write Clear Updates and Discussions", "Collaborate on Shared Documents", "Manage Tasks, Decisions, and Ownership", "Use Notifications without Losing Focus"]],
    ["Information Management", ["Create Reusable Templates and Knowledge Bases", "Link Decisions to Projects and Work", "Manage Versions and Resolve Conflicting Copies", "Keep Documentation Findable and Current"]],
    ["Security and Team Practice", ["Manage Membership and Access", "Protect Sensitive and External Information", "Establish Channel and Document Conventions", "Review Activity and Workspace Health"]],
    ["Effective Operations", ["Onboard a Teammate to the Workspace", "Audit and Retire Stale Content", "Integrate Collaboration with Delivery Tools", "Improve the Team's Information Flow"]],
  ],
  "misc-tools/Utilities": [
    ["Utility Foundations", ["Install and Configure {{course}}", "Understand Requests, Inputs, and Outputs", "Manage Environments and Credentials", "Choose a Safe Workflow for the Task"]],
    ["Everyday Use", ["Create and Inspect a Reusable Request or Script", "Work with Variables, Files, and Data", "Organize Repeated Tasks", "Export, Share, and Reproduce Results"]],
    ["Automation and Integration", ["Connect {{course}} to an API or Local Workflow", "Use Parameters and Environment Configuration", "Handle Errors, Retries, and Partial Results", "Automate a Repeatable Team Task"]],
    ["Security and Troubleshooting", ["Protect Tokens, Files, and Personal Data", "Validate Inputs before Running Commands", "Diagnose Common Errors", "Record Useful Logs and Results"]],
    ["Practical Mastery", ["Build a Small End-to-End Workflow", "Review Permissions and Operational Risks", "Document Setup and Usage", "Improve a Workflow from Real Feedback"]],
  ],
  "interviews/Technical": [
    ["Interview Foundations", ["Understand the Role and Interview Format", "Clarify Requirements before Solving", "Communicate Assumptions and Constraints", "Structure a Time-Bounded Answer"]],
    ["Technical Problem Solving", ["Explain Core {{course}} Concepts", "Compare Approaches and Trade-Offs", "Work through Edge Cases and Complexity", "Use Examples to Make Reasoning Clear"]],
    ["Design and Implementation", ["Break a Problem into Components", "Discuss Interfaces, Data, and Failure Modes", "Write or Sketch a Maintainable Solution", "Test the Solution with Representative Cases"]],
    ["Practice and Feedback", ["Handle Follow-Up Questions", "Recover when You Get Stuck", "Review an Answer for Gaps and Assumptions", "Use Feedback to Target Practice"]],
    ["Interview Readiness", ["Prepare a Concise Project Walkthrough", "Ask Useful Questions about the Role", "Manage Time and Interview Nerves", "Build a Focused Preparation Plan"]],
  ],
  "interviews/People": [
    ["People Interview Foundations", ["Understand the Role and Competencies", "Choose Specific Examples from Your Experience", "Structure a Situation, Action, and Result", "Be Clear about Your Individual Contribution"]],
    ["Behavioral Questions", ["Describe Collaboration and Conflict", "Explain a Mistake and What Changed", "Discuss Ownership, Ambiguity, and Learning", "Show Results with Honest Evidence"]],
    ["Leadership and Communication", ["Explain How You Influence without Authority", "Discuss Feedback and Difficult Conversations", "Describe How You Support a Team", "Connect Decisions to Stakeholder Needs"]],
    ["Practice and Reflection", ["Answer Follow-Ups without Overclaiming", "Keep Stories Concise and Relevant", "Identify Missing Evidence in an Answer", "Practice with Structured Feedback"]],
    ["Interview Readiness", ["Prepare Questions for the Interviewer", "Discuss Motivation and Role Fit", "Handle Unfamiliar Questions Thoughtfully", "Create a Personal Practice Plan"]],
  ],
  "mock-interviews/Practice rounds": [
    ["Prepare the Mock Round", ["Set the Role, Level, and Interview Format", "Review the Evaluation Rubric", "Warm Up with Clarifying Questions", "Manage Time and Narrate Your Reasoning"]],
    ["Run a Technical Simulation", ["Solve a Representative {{course}} Problem", "Explain Assumptions and Trade-Offs", "Respond to Hints and Follow-Up Changes", "Test and Summarize the Final Answer"]],
    ["Review Performance", ["Separate Correctness from Communication", "Find Gaps in Coverage and Reasoning", "Review Time Use and Recovery", "Turn Feedback into Specific Actions"]],
    ["Repeat with Progression", ["Practice a Harder Variant", "Improve Structure without Memorizing Scripts", "Track Recurring Strengths and Gaps", "Use a Consistent Self-Review Checklist"]],
    ["Build Readiness", ["Simulate Interview-Day Conditions", "Choose Focus Areas from Evidence", "Practice Concise Project Explanations", "Plan the Next Mock Round"]],
  ],
  "mock-interviews/People rounds": [
    ["Prepare the People Round", ["Choose Role-Relevant Experience Examples", "Review the Evaluation Criteria", "Set a Clear and Honest Answer Structure", "Practice Concise Storytelling"]],
    ["Run a Behavioral Simulation", ["Answer a Collaboration Scenario", "Discuss Conflict and a Difficult Decision", "Describe a Failure and What You Learned", "Handle Follow-Up Questions"]],
    ["Review and Improve", ["Check Relevance, Clarity, and Evidence", "Separate Team Results from Your Contribution", "Identify Vague or Overlong Answers", "Turn Feedback into Practice Goals"]],
    ["Practice Difficult Topics", ["Discuss Disagreement Respectfully", "Explain a Career Change or Gap", "Respond to an Unfamiliar Scenario", "Show Reflection without Overclaiming"]],
    ["Build Confidence", ["Simulate a Full People Interview", "Prepare Thoughtful Questions", "Track Improvement across Practice Rounds", "Plan a Final Review"]],
  ],
  "roadmaps/Roles": [
    ["Role Foundations", ["Understand the {{course}} Role and Responsibilities", "Map Skills to Day-to-Day Work", "Identify Prerequisites and Learning Gaps", "Set a Realistic Starting Point"]],
    ["Build Core Skills", ["Learn the Essential Concepts and Tools", "Practice with Small, Verifiable Exercises", "Study Production Workflows and Quality", "Connect Skills to a Portfolio Project"]],
    ["Progress to Intermediate Work", ["Design and Deliver a Complete Project", "Learn Collaboration and Review Practices", "Measure Quality, Reliability, and Impact", "Address Common Skill Gaps"]],
    ["Develop Depth", ["Study Advanced Patterns and Trade-Offs", "Operate and Improve Real Systems", "Build a Specialization from Experience", "Prepare for Role-Level Interviews"]],
    ["Track Your Growth", ["Create Milestones and Evidence of Progress", "Get Feedback from Practitioners", "Update the Roadmap from Project Results", "Plan Your Next Three Months"]],
  ],
  "career/Career": [
    ["Career Foundations", ["Define Target Roles and Constraints", "Inventory Skills, Projects, and Evidence", "Set Career Goals with a Clear Time Horizon", "Choose a Sustainable Search Strategy"]],
    ["Present Your Experience", ["Build a Role-Focused Resume", "Describe Projects with Outcomes and Evidence", "Create a Credible Portfolio", "Keep Professional Profiles Consistent"]],
    ["Search and Connect", ["Find Relevant Roles and Teams", "Tailor Applications without Misrepresenting Experience", "Build Professional Relationships Respectfully", "Track Applications and Follow-Ups"]],
    ["Interview and Decide", ["Prepare Stories and Project Walkthroughs", "Evaluate Role Scope and Team Fit", "Compare Offers and Total Compensation", "Ask Clear Questions and Negotiate Professionally"]],
    ["Grow over Time", ["Plan Skill Development around Real Work", "Seek Feedback and Sponsorship", "Build a Sustainable Professional Network", "Review and Update Your Career Plan"]],
  ],
  "blogs/Writing": [
    ["Editorial Foundations", ["Define the Reader and Article Promise", "Choose a Focused Technical Topic", "Research Claims and Track Sources", "Build an Outline around One Learning Goal"]],
    ["Draft with Clarity", ["Explain Context before Implementation", "Use Examples, Code, and Diagrams Well", "Describe Trade-Offs and Limitations", "Write a Useful Introduction and Conclusion"]],
    ["Review and Edit", ["Check Technical Accuracy and Reproducibility", "Edit for Structure, Tone, and Plain Language", "Review Links, Attribution, and Permissions", "Use Feedback without Losing the Article's Purpose"]],
    ["Publish and Maintain", ["Format for Web and Mobile Reading", "Add Metadata and Accessible Media", "Publish and Share with the Intended Audience", "Update Examples as Tools and Versions Change"]],
    ["Build a Writing Practice", ["Plan a Sustainable Editorial Calendar", "Measure Reader Questions and Useful Outcomes", "Turn Work Notes into Future Articles", "Review and Improve Your Writing Process"]],
  ],
  "blogs/Publishing": [
    ["Channel Foundations", ["Define the Audience and Channel Promise", "Choose Formats and a Sustainable Cadence", "Plan a Series around Reader Needs", "Set Up a Clear Publishing Workflow"]],
    ["Create Useful Content", ["Script and Structure a Newsletter or Video", "Explain a Technical Idea with Examples", "Prepare Accessible Visuals and Captions", "Review Claims, Sources, and Permissions"]],
    ["Publish Reliably", ["Format Content for the Channel", "Manage RSS, Email, and Platform Metadata", "Preview Links, Media, and Device Layouts", "Schedule and Correct a Publication"]],
    ["Reach and Engage Readers", ["Write Clear Titles and Descriptions", "Invite Specific and Constructive Feedback", "Repurpose Content without Losing Context", "Build a Consistent Distribution Routine"]],
    ["Improve the Channel", ["Read Analytics in Context", "Protect Reader Data and Trust", "Update or Retire Outdated Content", "Plan the Next Content Cycle"]],
  ],
  "wellbeing/Movement": [
    ["Movement Foundations", ["Assess Your Starting Point and Constraints", "Set Safe and Realistic Activity Goals", "Prepare a Space and Simple Routine", "Use Warm-Ups and Gradual Progression"]],
    ["Build a Routine", ["Choose Movements for Mobility and Strength", "Use Bodyweight and Minimal Equipment", "Balance Work, Rest, and Recovery", "Adapt Sessions for Time and Energy"]],
    ["Practice Safely", ["Use Controlled Range of Motion", "Recognize Discomfort and Stop Signals", "Scale Exercises to Your Ability", "Track Consistency without Overtraining"]],
    ["Make It Sustainable", ["Break Up Long Sedentary Periods", "Connect Movement to Daily Habits", "Adjust for Travel and Busy Weeks", "Review Progress and Change One Variable"]],
    ["Long-Term Wellbeing", ["Plan Rest and Recovery", "Build a Flexible Weekly Schedule", "Maintain Motivation without All-or-Nothing Goals", "Know When to Seek Qualified Guidance"]],
  ],
  "wellbeing/Mind and nutrition": [
    ["Wellbeing Foundations", ["Notice Stress, Energy, and Attention Patterns", "Set a Realistic Personal Goal", "Create a Calm and Consistent Practice Space", "Understand Individual Needs and Limits"]],
    ["Build a Daily Practice", ["Use a Short Breathing or Mindfulness Routine", "Plan Regular Meals and Hydration", "Support Focus with Breaks and Sleep Habits", "Adapt Habits to Your Schedule"]],
    ["Practice with Care", ["Start Gradually and Avoid Forcing Techniques", "Notice How a Practice Affects You", "Use Reliable Nutrition Information", "Separate General Guidance from Individual Care"]],
    ["Sustainable Habits", ["Plan for Stressful and Irregular Weeks", "Reduce Friction around Healthy Choices", "Track Habits without Excessive Monitoring", "Adjust Based on Energy and Wellbeing"]],
    ["Long-Term Balance", ["Build a Personal Routine You Can Maintain", "Recognize When Professional Support May Help", "Review Habits without Self-Blame", "Create a Healthy Workday Plan"]],
  ],
  "marketing/Marketing": [
    ["Marketing Foundations", ["Define Audience, Positioning, and Goals", "Map Search Intent and Customer Questions", "Create a Content and Channel Strategy", "Set Baselines before Running Campaigns"]],
    ["Create and Optimize", ["Plan Useful Search-Focused Content", "Improve Technical SEO and Site Discoverability", "Build an Email Campaign and Consent Flow", "Write Clear Calls to Action"]],
    ["Measure Performance", ["Configure Analytics Events and Conversions", "Use UTM Parameters and Campaign Naming", "Read Funnels, Search Data, and Engagement", "Separate Correlation from Campaign Impact"]],
    ["Experiment and Improve", ["Form a Testable Marketing Hypothesis", "Run an Ethical, Measurable Experiment", "Improve Pages from User Behavior", "Review Campaign Quality and Cost"]],
    ["Responsible Growth", ["Respect Privacy and Consent", "Avoid Misleading Claims and Dark Patterns", "Report Results with Limitations", "Build a Sustainable Growth Plan"]],
  ],
  "video/Tools": [
    ["Video Workflow Foundations", ["Plan the Audience, Goal, and Format", "Organize Footage, Audio, and Project Files", "Understand the Editing Timeline and Media", "Create a Simple Storyboard"]],
    ["Edit a First Video", ["Select and Arrange Useful Takes", "Cut for Clarity, Pace, and Continuity", "Clean Dialogue and Balance Audio", "Add Titles, Captions, and Supporting Visuals"]],
    ["Polish and Review", ["Use Color Correction Consistently", "Check Captions, Levels, and Accessibility", "Review Pacing on Multiple Devices", "Resolve Media and Playback Problems"]],
    ["Export and Publish", ["Choose Resolution, Codec, and Bitrate", "Export Versions for Different Platforms", "Manage Project Archives and Source Media", "Create a Thumbnail and Clear Description"]],
    ["Improve the Production", ["Build a Repeatable Editing Template", "Use Feedback to Revise a Cut", "Track Audience Retention in Context", "Plan the Next Video from Lessons Learned"]],
  ],
};

const defaultBlueprint = [
  ["Foundations", ["Purpose and Core Concepts of {{course}}", "Key Components and Terminology", "Choose a Suitable Use Case", "Set Up a Reproducible Learning Environment"]],
  ["Core Workflow", ["Follow the Main {{course}} Workflow", "Configure Inputs and Outputs", "Handle Common Scenarios and Edge Cases", "Build a Small End-to-End Example"]],
  ["Quality and Troubleshooting", ["Validate Results against Requirements", "Test Failure and Boundary Conditions", "Diagnose Common Problems", "Improve Reliability and Maintainability"]],
  ["Advanced Practice", ["Explore Advanced Features and Trade-Offs", "Integrate {{course}} with Related Tools", "Manage Performance, Security, and Scale", "Review a Realistic Case Study"]],
  ["Production and Mastery", ["Prepare a Workflow for Production Use", "Monitor Outcomes and Maintain the Setup", "Document Decisions and Best Practices", "Practice Interview and Review Questions"]],
];

const buildSections = (module, group, track) => {
  const blueprint = track.outline
    ? track.outline.map(([title, ...lessons]) => [title, lessons])
    : blueprints[`${module.id}/${track.slug === "serverless" ? "Serverless" : group.name}`] || defaultBlueprint;
  return blueprint.map(([slug, lessonTitles]) => {
    const personalize = (value) => value.replaceAll("{{course}}", track.name);
    return section(
      slugify(slug),
      personalize(slug),
      lessonTitles.map(personalize),
    );
  });
};

export const remainingCourses = Object.fromEntries(
  modules
    .filter((module) => !completedModules.has(module.id))
    .flatMap((module) =>
      module.groups.flatMap((group) =>
        group.tracks.map((track) => {
          const sections = buildSections(module, group, track);
          return [`${module.id}/${track.slug}`, {
            moduleId: module.id,
            name: track.name,
            sections,
            articles: sections.flatMap((item) => item.lessons),
            componentPath: `${module.id}/${track.slug}`,
          }];
        }),
      ),
    ),
);
