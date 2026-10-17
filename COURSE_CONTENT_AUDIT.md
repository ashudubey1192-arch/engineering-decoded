# Course content audit

Updated 2026-10-18. Reference scope: the public [AlgoMaster catalog](https://algomaster.io/courses); authenticated and premium chapters were not inspected or copied.

287 local courses contain 6278 navigable lessons. There are 351 authored interview labs across 21 course areas. The OS and networking courses include every entry in their public roadmaps (153 and 111 respectively), plus 12 retained workshops each. The other four new curricula retain 12 lessons each. Existing lesson URLs remain available.

## Learning features

- Every lesson offers a practice studio. Technical lessons expose 7 calculated models and 8 executable JavaScript exercises with sample/boundary tests, reference solutions, and scored checks. Nontechnical lessons use a contextual reflection worksheet.
- Models cover queues, LRU replacement, round-robin scheduling, HTTPS timing, fraud thresholds, token buckets, and two-sum. They recompute from input values and expose their assumptions.
- Shared tutorials include a guided reading animation. This highlights authored text and is deliberately labeled separately from calculated simulations.
- Interview labs retain their specific worked walkthroughs, trade-offs, explained answers, and hands-on extensions.

## Verification and limitations

Run npm run check:core-cs, npm run check:tutorials, npm run check:interview-courses, npm run check:lesson-depth, and npm run test:workshop. LESSON_DEPTH_AUDIT.json identifies the rendering/content path for every lesson. Topic matching is an automated coverage signal, not a claim that every chapter has received independent expert review. Shared mechanisms are reused where applicable; not every route has a unique simulation or executable exercise. The browser runner executes JavaScript only, while C++, C#, and other native examples remain reading/local implementation exercises. CORE_CS_ROADMAP_AUDIT.md maps every OS and networking roadmap entry to its local lesson. Other curricula do not claim chapter-for-chapter parity with the reference site.

| Local course | Total lessons | Authored interview labs |
|---|---:|---:|
| core-cs/operating-systems | 165 | 165 |
| core-cs/computer-networks | 123 | 123 |
| architecture/system-design-fundamentals | 185 | 1 |
| architecture/high-level-design | 44 | 1 |
| architecture/low-level-design | 45 | 1 |
| architecture/microservices | 76 | 1 |
| architecture/api-design | 69 | 1 |
| architecture/clean-code | 66 | 0 |
| architecture/clean-architecture | 66 | 0 |
| architecture/design-patterns | 73 | 0 |
| architecture/ddd | 72 | 0 |
| dsa/dsa-foundations | 130 | 1 |
| dsa/arrays | 36 | 0 |
| dsa/linked-lists | 5 | 0 |
| dsa/stacks | 4 | 0 |
| dsa/queues-and-deques | 4 | 0 |
| dsa/hash-tables | 4 | 0 |
| dsa/trees | 6 | 0 |
| dsa/heaps-and-priority-queues | 4 | 0 |
| dsa/graphs | 7 | 0 |
| dsa/tries | 4 | 0 |
| dsa/disjoint-sets | 4 | 0 |
| dsa/advanced-data-structures | 6 | 0 |
| dsa/binary-search | 4 | 0 |
| dsa/sorting-algorithms | 7 | 0 |
| dsa/recursion | 4 | 0 |
| dsa/divide-and-conquer | 4 | 0 |
| dsa/dynamic-programming | 5 | 0 |
| dsa/greedy | 4 | 0 |
| dsa/backtracking | 4 | 0 |
| coding-patterns/arrays | 14 | 0 |
| coding-patterns/strings | 11 | 0 |
| coding-patterns/hashmap-and-hashset | 9 | 0 |
| coding-patterns/two-pointers | 7 | 0 |
| coding-patterns/sliding-window | 7 | 0 |
| coding-patterns/prefix-sum | 3 | 0 |
| coding-patterns/sorting | 4 | 0 |
| coding-patterns/binary-search | 3 | 0 |
| coding-patterns/linked-list | 6 | 0 |
| coding-patterns/stack | 2 | 0 |
| coding-patterns/monotonic-stack | 4 | 0 |
| coding-patterns/queue-and-deque | 5 | 0 |
| coding-patterns/heap-and-priority-queue | 3 | 0 |
| coding-patterns/matrix-and-2d-array | 9 | 0 |
| coding-patterns/recursion | 3 | 0 |
| coding-patterns/backtracking | 5 | 0 |
| coding-patterns/binary-trees | 7 | 0 |
| coding-patterns/binary-search-tree | 4 | 0 |
| coding-patterns/trie | 2 | 0 |
| coding-patterns/graph-fundamentals | 3 | 0 |
| coding-patterns/graph-dfs | 5 | 0 |
| coding-patterns/graph-bfs | 4 | 0 |
| coding-patterns/topological-sort | 2 | 0 |
| coding-patterns/union-find-and-disjoint-set | 3 | 0 |
| coding-patterns/shortest-path-algorithms | 3 | 0 |
| coding-patterns/minimum-spanning-tree | 3 | 0 |
| coding-patterns/greedy-algorithms | 4 | 0 |
| coding-patterns/dynamic-programming-fundamentals | 4 | 0 |
| coding-patterns/1d-dynamic-programming | 4 | 0 |
| coding-patterns/2d-dynamic-programming | 4 | 0 |
| coding-patterns/knapsack-dp | 5 | 0 |
| coding-patterns/string-dp | 5 | 0 |
| coding-patterns/stock-dp-and-state-machines | 3 | 0 |
| coding-patterns/lis-pattern | 2 | 0 |
| coding-patterns/interval-dp | 2 | 0 |
| coding-patterns/bit-manipulation | 4 | 0 |
| coding-patterns/bitmasking | 2 | 0 |
| coding-patterns/math-algorithms | 2 | 0 |
| coding-patterns/interval-problems | 3 | 0 |
| coding-patterns/sweep-line | 3 | 0 |
| coding-patterns/monotonic-queue | 2 | 0 |
| coding-patterns/segment-tree | 2 | 0 |
| coding-patterns/fenwick-tree-and-bit | 2 | 0 |
| coding-patterns/advanced-string-algorithms | 2 | 0 |
| coding-patterns/advanced-graph-algorithms | 2 | 0 |
| coding-patterns/design-based-coding-problems | 3 | 0 |
| coding-patterns/java-collections-for-coding-interviews | 4 | 0 |
| coding-patterns/java-comparator-problems | 3 | 0 |
| coding-patterns/concurrency-patterns | 2 | 0 |
| coding-patterns/problem-solving-techniques | 5 | 0 |
| ai/machine-learning | 24 | 0 |
| ai/deep-learning | 24 | 0 |
| ai/data-science | 24 | 0 |
| ai/python | 24 | 0 |
| ai/ml-system-design | 12 | 12 |
| ai/ai-engineering | 88 | 1 |
| ai/generative-ai | 35 | 0 |
| ai/llms | 20 | 0 |
| ai/prompt-engineering | 20 | 0 |
| ai/rag | 36 | 0 |
| ai/ai-agents | 20 | 0 |
| backend/java | 104 | 1 |
| backend/python | 41 | 1 |
| backend/node-js | 40 | 0 |
| backend/go | 41 | 1 |
| backend/cpp | 12 | 12 |
| backend/csharp | 12 | 12 |
| backend/spring-boot | 71 | 0 |
| backend/express-js | 40 | 0 |
| backend/fastapi | 40 | 0 |
| backend/django | 40 | 0 |
| backend/rest-api | 40 | 0 |
| backend/graphql | 40 | 0 |
| backend/authentication | 40 | 0 |
| backend/oauth | 40 | 0 |
| databases/sql | 31 | 1 |
| databases/postgresql | 30 | 0 |
| databases/mysql | 30 | 0 |
| databases/oracle | 30 | 0 |
| databases/transactions | 30 | 0 |
| databases/mongodb | 30 | 0 |
| databases/cassandra | 30 | 0 |
| databases/redis | 30 | 0 |
| databases/influxdb | 30 | 0 |
| databases/hybrid-database-fundamentals | 30 | 0 |
| databases/distributed-sql | 30 | 0 |
| databases/multi-model-databases | 30 | 0 |
| databases/htap-databases | 30 | 0 |
| databases/vector-database-fundamentals | 30 | 0 |
| databases/pinecone | 30 | 0 |
| databases/milvus | 30 | 0 |
| databases/weaviate | 30 | 0 |
| databases/chroma | 30 | 0 |
| databases/indexing | 30 | 0 |
| databases/replication | 30 | 0 |
| databases/sharding | 30 | 0 |
| databases/partitioning | 30 | 0 |
| frontend/html | 40 | 0 |
| frontend/css | 40 | 0 |
| frontend/javascript | 40 | 0 |
| frontend/typescript | 40 | 0 |
| frontend/react | 62 | 0 |
| frontend/angular | 68 | 0 |
| frontend/vue | 40 | 0 |
| frontend/next-js | 40 | 0 |
| frontend/tailwind-css | 40 | 0 |
| frontend/material-ui | 40 | 0 |
| frontend/redux | 40 | 0 |
| frontend/vite | 40 | 0 |
| messaging/kafka | 31 | 1 |
| messaging/rabbitmq | 30 | 0 |
| messaging/solace | 30 | 0 |
| messaging/event-streaming | 30 | 0 |
| messaging/pub-sub | 30 | 0 |
| messaging/dead-letter-queue | 30 | 0 |
| messaging/idempotency | 30 | 0 |
| messaging/outbox-pattern | 30 | 0 |
| cloud/aws | 20 | 0 |
| cloud/azure | 20 | 0 |
| cloud/google-cloud | 20 | 0 |
| cloud/serverless | 20 | 0 |
| devops/docker | 20 | 0 |
| devops/kubernetes | 20 | 0 |
| devops/helm | 20 | 0 |
| devops/openshift | 20 | 0 |
| devops/terraform | 20 | 0 |
| devops/jenkins | 20 | 0 |
| devops/github-actions | 20 | 0 |
| devops/ansible | 20 | 0 |
| backend-tooling/hibernate | 20 | 0 |
| backend-tooling/jpa | 20 | 0 |
| backend-tooling/swagger | 20 | 0 |
| backend-tooling/openapi | 20 | 0 |
| backend-tooling/caffeine | 20 | 0 |
| backend-tooling/guava-cache | 20 | 0 |
| backend-tooling/spring-cache | 12 | 0 |
| backend-tooling/redis | 12 | 0 |
| backend-tooling/memcached | 12 | 0 |
| backend-tooling/postgresql | 12 | 0 |
| backend-tooling/maven | 20 | 0 |
| backend-tooling/gradle | 20 | 0 |
| frontend-tooling/npm | 20 | 0 |
| frontend-tooling/yarn | 20 | 0 |
| frontend-tooling/pnpm | 20 | 0 |
| frontend-tooling/webpack | 20 | 0 |
| frontend-tooling/vite | 20 | 0 |
| frontend-tooling/babel | 20 | 0 |
| frontend-tooling/storybook | 20 | 0 |
| frontend-tooling/eslint | 20 | 0 |
| testing/unit-testing | 20 | 0 |
| testing/integration-testing | 20 | 0 |
| testing/api-testing | 20 | 0 |
| testing/playwright | 20 | 0 |
| mobile/react-native-expo | 12 | 0 |
| mobile/flutter | 12 | 0 |
| mobile/kotlin-compose-multiplatform | 12 | 0 |
| mobile/react-vite-capacitor | 12 | 0 |
| mobile/ionic-capacitor | 12 | 0 |
| mobile/nativescript | 12 | 0 |
| mobile/dotnet-maui | 12 | 0 |
| mobile/tauri-react-vite | 12 | 0 |
| mobile/qt | 12 | 0 |
| mobile/pwa | 12 | 0 |
| mobile/native-android-ios | 12 | 0 |
| mobile/unity-godot | 12 | 0 |
| desktop/tauri-react-vite | 12 | 0 |
| desktop/electron-react | 12 | 0 |
| desktop/flutter | 12 | 0 |
| desktop/qt | 12 | 0 |
| desktop/avalonia | 12 | 0 |
| desktop/javafx | 12 | 0 |
| developer-tools/intellij-idea | 20 | 0 |
| developer-tools/vs-code | 20 | 0 |
| developer-tools/eclipse | 20 | 0 |
| developer-tools/git | 21 | 1 |
| developer-tools/github | 20 | 0 |
| developer-tools/gitlab | 20 | 0 |
| developer-tools/browser-devtools | 20 | 0 |
| developer-tools/ai-coding-tools | 20 | 0 |
| communication/technical-writing | 20 | 0 |
| communication/presentation-skills | 20 | 0 |
| communication/listening-skills | 20 | 0 |
| communication/stakeholder-communication | 20 | 0 |
| communication/corporate-vocabulary | 20 | 0 |
| communication/documentation | 20 | 0 |
| communication/feedback | 20 | 0 |
| communication/negotiation | 20 | 0 |
| leadership/team-leadership | 20 | 0 |
| leadership/engineering-management | 20 | 0 |
| leadership/requirement-gathering | 20 | 0 |
| leadership/project-management | 20 | 0 |
| leadership/agile | 20 | 0 |
| leadership/scrum | 20 | 0 |
| leadership/kanban | 20 | 0 |
| leadership/jira | 20 | 0 |
| misc-tools/notion | 20 | 0 |
| misc-tools/confluence | 20 | 0 |
| misc-tools/slack | 20 | 0 |
| misc-tools/teams | 20 | 0 |
| misc-tools/postman | 20 | 0 |
| misc-tools/powershell | 20 | 0 |
| misc-tools/shell-scripting | 20 | 0 |
| misc-tools/microsoft-office | 20 | 0 |
| interviews/java-interview | 20 | 0 |
| interviews/react-interview | 20 | 0 |
| interviews/python-interview | 20 | 0 |
| interviews/system-design-interview | 20 | 0 |
| interviews/concurrency-interview | 12 | 12 |
| interviews/behavioral-interview | 21 | 1 |
| interviews/leadership-interview | 20 | 0 |
| interviews/hr-interview | 20 | 0 |
| mock-interviews/java-mock-interview | 20 | 0 |
| mock-interviews/react-mock-interview | 20 | 0 |
| mock-interviews/python-mock-interview | 20 | 0 |
| mock-interviews/system-design-mock-interview | 20 | 0 |
| mock-interviews/behavioral-mock-interview | 20 | 0 |
| mock-interviews/leadership-mock-interview | 20 | 0 |
| roadmaps/frontend-roadmap | 20 | 0 |
| roadmaps/backend-roadmap | 20 | 0 |
| roadmaps/devops-roadmap | 20 | 0 |
| roadmaps/ai-engineer-roadmap | 20 | 0 |
| career/resume-builder | 20 | 0 |
| career/job-search | 21 | 1 |
| career/linkedin-profile | 20 | 0 |
| career/technical-leadership | 20 | 0 |
| blogs/technical-blogging | 20 | 0 |
| blogs/content-planning | 20 | 0 |
| blogs/markdown-and-mdx | 20 | 0 |
| blogs/technical-diagrams | 20 | 0 |
| blogs/newsletter | 20 | 0 |
| blogs/rss-feed | 20 | 0 |
| blogs/youtube-content | 20 | 0 |
| blogs/content-analytics | 20 | 0 |
| wellbeing/home-workout | 20 | 0 |
| wellbeing/bodyweight-workout | 20 | 0 |
| wellbeing/stretching | 20 | 0 |
| wellbeing/yoga | 20 | 0 |
| wellbeing/pranayama | 20 | 0 |
| wellbeing/meditation | 20 | 0 |
| wellbeing/nutrition | 20 | 0 |
| wellbeing/healthy-developer-habits | 20 | 0 |
| marketing/seo | 20 | 0 |
| marketing/content-marketing | 20 | 0 |
| marketing/google-analytics | 20 | 0 |
| marketing/email-marketing | 20 | 0 |
| video/davinci-resolve | 20 | 0 |
| video/premiere-pro | 20 | 0 |
| video/capcut | 20 | 0 |
| video/youtube-strategy | 20 | 0 |
| social-media/linkedin | 3 | 0 |
| social-media/github | 3 | 0 |
| social-media/medium | 3 | 0 |
| social-media/substack | 3 | 0 |
| social-media/slack | 3 | 0 |
| social-media/zoom | 3 | 0 |
| social-media/teams | 3 | 0 |
| social-media/outlook | 3 | 0 |

## Technical references

- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- [C# asynchronous programming](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
- [HTTP caching specification](https://www.rfc-editor.org/rfc/rfc9111.html)
- [Production ML systems](https://developers.google.com/machine-learning/crash-course/production-ml-systems)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html)
- [Python default arguments](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values)
- [Go channels](https://go.dev/tour/concurrency/2)
- [Git revert](https://git-scm.com/docs/git-revert)
- [Kafka design](https://kafka.apache.org/41/design/design/)
