import { profile, lab } from "./databaseLessonProfiles.js";

const vectorLabs = (name, setup, write, query) => [
  lab(
    `${name} · environment contract`,
    setup,
    "Use a disposable collection/index with explicit three-dimensional vectors. These toy vectors test plumbing and ranking, not language understanding.",
  ),
  lab(
    `${name} · record design`,
    "id: doc-a:chunk-0:v1\nvector: [1, 0, 0]\nmetadata: {tenant: t1, source: doc-a, model: toy-v1}\nsource text: retained in authoritative document storage",
    "Record identity, tenant, source, and model version separately. A real model must produce the same dimension and representation for documents and queries.",
  ),
  lab(
    `${name} · ingestion example`,
    write,
    "Insert stable IDs with compatible vectors. Inspect write errors, then wait for documented query visibility before checking results.",
  ),
  lab(
    `${name} · retrieval example`,
    query,
    "For query [1, 0, 0], doc-a should rank ahead of orthogonal doc-b under cosine similarity or L2 distance. Score direction depends on the metric/API.",
  ),
  lab(
    `${name} · consistency experiment`,
    "upsert doc-a version 1 → query until visible\nupsert version 2 using same ID → verify replacement\ndelete doc-a → verify retrieval stops returning it\nrepeat after process restart or reconnection",
    "Measure visibility instead of assuming immediate cross-request consistency. Keep a source manifest so missing or stale chunks can be reconciled.",
  ),
  lab(
    `${name} · retrieval evaluation`,
    "exact top-3: [a, b, c]\napproximate top-3: [a, c, d]\nrecall@3 = 2 / 3\nrepeat with tenant filters and a held-out query set",
    "This example has recall@3 of about 0.667. Also measure relevance, latency, unauthorized-result count, freshness, and deletion propagation.",
  ),
];

export const databaseVectorProfiles = {
  "vector-database-fundamentals": profile(
    "https://milvus.io/docs/metric.md",
    "Follow document chunks from source text to embeddings and nearest-neighbor retrieval. Numerical examples use tiny explicit vectors, so no embedding service or API key is needed.",
    `
A vector database retrieves nearby representations rather than exact keyword matches alone. Similarity reflects the embedding model and metric, not a guarantee of truth.
The retrieval path includes chunking, embedding, ingestion, indexing, filtering, and ranking. Measure each stage separately before blaming the database for poor answers.
Begin with an exact local vector calculation, then choose a documented engine for approximate search. Record model version, dimension, metric, and normalization.
Store one vector per defined unit such as a document chunk. Preserve source ID, offset, tenant, and embedding version for traceability and deletion.
Use a labeled evaluation set and an exact-search baseline alongside latency tools. A successful nearest-neighbor response does not establish retrieval quality.
Choose chunk boundaries that preserve meaning and allow source attribution. Overlapping chunks improve context but create duplicate candidates and more storage.
Derive stable IDs from source, chunk, and version. Re-embedding with changed boundaries needs a manifest to delete chunks that no longer exist.
Vector stores typically do not enforce source-document foreign keys. Reconcile orphaned vectors and propagate source deletions through a durable workflow.
Dimension, numeric type, metric, and model version are part of the schema. Equal vector length does not make embeddings from different models comparable.
Build a new collection for a new embedding space, evaluate it, then switch retrieval. Mixing old and new model vectors can corrupt ranking silently.
Upsert by stable ID and inspect per-record failures. Treat model generation and vector persistence as separate retryable steps with durable progress.
Encode the query with the compatible model and request bounded top-k results. Similarity thresholds require evaluation on your corpus rather than arbitrary constants.
Apply tenant and metadata restrictions within the authorized retrieval scope. Post-filtering a tiny top-k can return too few relevant authorized results.
Nearest-neighbor ranking is not a full-table aggregate. Compute authoritative counts and statistics using suitable metadata or source systems.
Batch embedding and ingestion separately according to their limits. Checkpoint by source version and retry partial batches without creating duplicate chunks.
Compare approximate results to exact neighbors on a sample. Candidate generation, filtering, and reranking contribute distinct latency and recall costs.
HNSW, inverted-file approaches, and exact scans trade memory, build time, latency, and recall differently. Choose by measured workload and supported implementation.
Cache query embeddings by model/version and normalized input, respecting privacy. Result caches also depend on corpus version and authorization context.
Partition by tenant or another routing key when it limits search safely. Tiny isolated indexes and huge shared indexes have different overhead and recall behavior.
Measure recall@k and relevance with p95/p99 latency. Tuning only speed can hide missed neighbors; tuning only recall can exceed the resource budget.
Write visibility and multi-record atomicity are engine-specific. A document split into chunks may be partially searchable unless publication is coordinated.
Concurrent re-embedding jobs need source-version checks. Otherwise an older job can overwrite newer vectors after finishing later.
Replication improves availability but does not fix a bad embedding model. Confirm what failures the selected deployment and consistency policy tolerate.
Retain original documents, embedding versions, and chunk manifests for rebuilds. Test whether re-embedding time meets recovery objectives.
Separate embedding-service errors, invalid dimensions, rate limits, and ambiguous upserts. Stable IDs and a durable source manifest make repair possible.
Embeddings can contain sensitive information; treat them as protected data. Enforce tenant authorization before retrieval and propagate access revocations promptly.
Monitor recall samples, empty-result rates, ingestion backlog, source-to-index lag, and deletion lag. Infrastructure health alone misses relevance regressions.
Raw float32 vector bytes equal count × dimension × 4. Add index graph/centroids, metadata, source copies, replicas, and build headroom.
Shadow-test a new model/index with fixed queries and filters. Compare quality and authorization before redirecting traffic, keeping rollback possible.
Version the complete retrieval pipeline and retain evaluation fixtures. A release changes behavior when chunking, model, metric, index, or reranker changes.
`,
    vectorLabs(
      "Vector fundamentals",
      "documents: a=[1,0,0], b=[0,1,0]\nquery: q=[1,0,0]\nmetric: cosine similarity\nall vectors have nonzero unit length",
      "# Python · standard library only\nvectors = {'a': [1, 0, 0], 'b': [0, 1, 0]}\nassert all(len(v) == 3 for v in vectors.values())",
      "# Python · exact dot products for these unit vectors\nq = [1, 0, 0]\nvectors = {'a': [1, 0, 0], 'b': [0, 1, 0]}\nscores = {k: sum(x*y for x,y in zip(q,v)) for k,v in vectors.items()}\nprint(sorted(scores, key=scores.get, reverse=True))",
    ),
  ),
  pinecone: profile(
    "https://docs.pinecone.io/guides/get-started/overview",
    "Use a Pinecone bring-your-own-vector index for document retrieval. Examples assume an already-created dense three-dimensional cosine index and the current compatible Python SDK; credentials stay in environment variables.",
    `
Pinecone is a managed retrieval service. Separate raw-vector indexes from integrated-embedding workflows because their ingestion payloads and model responsibilities differ.
The control plane manages indexes while the data plane serves records and queries. Target the correct index host and namespace for each operation.
Create an authorized development project and a dense dimension-3 cosine index for the toy lab. Install a compatible pinecone SDK and record its version.
Records contain IDs, vectors, and metadata inside namespaces. Keep authoritative text and a source manifest when the retrieval index is a derived representation.
Use index descriptions, statistics, request metrics, and a retrieval evaluation set. Check index readiness and data freshness separately.
Use one stable record per chunk and a namespace strategy suited to tenant isolation. An application still must authorize the namespace it selects.
IDs are scoped to their namespace. Reuse an ID for an intentional replacement and carry source/chunk version in metadata for reconciliation.
Pinecone metadata links do not enforce relational foreign keys. Source deletions and re-chunking require explicit removal of obsolete records.
Match index dimension and metric to embeddings. Metadata field types and filter semantics must match the documented data API.
Use a new index or compatible versioned namespace when changing embedding spaces. A dimension match alone does not establish model compatibility.
Upsert replaces records with matching IDs in the target namespace. Avoid dropping needed metadata when sending a replacement payload.
For raw vectors, query with a compatible vector and top_k. Integrated embedding search uses a different request contract and must not be mixed accidentally.
Metadata filters narrow candidate scope. Derive tenant scope on the server; never allow callers to choose an arbitrary namespace unchecked.
Index statistics support operational visibility but do not turn Pinecone into an OLAP engine. Keep exact financial aggregates in their authoritative system.
Respect documented batch and rate limits and inspect failures. Large initial loads may use supported import workflows rather than one unbounded upsert request.
There is no generic SQL EXPLAIN for vector queries. Evaluate latency and recall with representative metadata-filter selectivity and top-k values.
Managed index internals are not necessarily user-tunable HNSW settings. Use only configuration controls supported by the selected Pinecone index type.
Cache embeddings separately from retrieval results. Include namespace, model version, filter scope, and corpus freshness in result-cache decisions.
Namespaces organize record isolation and query scope; deployment scaling controls depend on index type. Measure tenant skew instead of assuming equal demand.
Tune payload size, top_k, filter selectivity, and ingestion concurrency. Avoid returning full vector values when only IDs and metadata are needed.
Pinecone documents eventual consistency for data operations. An accepted upsert may not be immediately visible to a subsequent query.
Concurrent upserts to the same ID need application version coordination. A late old job can replace newer content without business-level conflict checks.
Managed infrastructure does not remove the need to define regional availability and recovery objectives. Confirm guarantees for the actual service configuration.
Use supported backup/export options for the index type and retain source records for rebuilding. Include embedding generation cost in recovery estimates.
Back off on rate limits and retry with stable record IDs. Distinguish invalid vectors from temporary failures and unknown accepted writes.
Keep API keys server-side and scope access appropriately. Namespaces are selected by the trusted service after verifying the caller's tenant membership.
Track query latency, throttling, ingestion errors, freshness, and relevance. A ready index can still contain an incomplete source corpus.
Estimate vector count, dimension, metadata, request volume, and growth. Validate service limits and measured cost for the chosen deployment.
Build and validate a parallel index for model changes. Switch host/namespace routing only after comparing retrieval quality and deletion completeness.
Record index host, metric, model version, namespace ownership, and rebuild procedure. Test a missing record, rate-limit response, and revoked tenant access.
`,
    vectorLabs(
      "Pinecone",
      "Prerequisites: dense dimension=3 metric=cosine index already created\nEnvironment: PINECONE_API_KEY and PINECONE_INDEX_HOST\nPython dependency: compatible pinecone SDK\nUse namespace course-lab only in a disposable project.",
      "import os\nfrom pinecone import Pinecone\npc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])\nindex = pc.Index(host=os.environ['PINECONE_INDEX_HOST'])\nindex.upsert(namespace='course-lab', vectors=[\n {'id': 'doc-a', 'values': [1,0,0], 'metadata': {'tenant':'t1'}},\n {'id': 'doc-b', 'values': [0,1,0], 'metadata': {'tenant':'t1'}}\n])",
      "# Continue with index from the ingestion example, after data becomes visible.\nresult = index.query(namespace='course-lab', vector=[1,0,0],\n top_k=2, filter={'tenant': {'$eq': 't1'}}, include_metadata=True)\nprint(result)",
    ),
  ),
  milvus: profile(
    "https://milvus.io/docs/overview.md",
    "Use Milvus collections for explicit-vector retrieval. The Python lab uses Milvus Lite through a supported pymilvus environment; a local file does not demonstrate distributed Milvus availability.",
    `
Milvus supports vector retrieval with scalar fields and configurable indexes. Distinguish Milvus Lite, standalone, and distributed deployments before making operational assumptions.
Collections organize entities; segments and index/query components manage storage and search. Distributed deployments separate responsibilities that a local lab hides.
Install a compatible pymilvus distribution with Lite support on a supported platform, or connect to a documented server deployment. Record client/server versions.
An entity has a primary key, vector field, and scalar fields. Define dimension and metric consistently across collection creation and query vectors.
Use collection descriptions, index/load state, metrics, and evaluation queries. A collection existing is not the same as being ready for every search workload.
Represent document chunks as entities with source and tenant fields. Decide explicit schema versus dynamic fields based on validation and filtering needs.
Choose manual stable IDs for repeatable ingestion, or manage generated IDs with a durable mapping. Primary-key behavior and upsert semantics need deliberate use.
Scalar references to source documents are not relational foreign keys. Reconcile deleted sources and obsolete chunk IDs independently.
Define vector dimension, field types, maximum text lengths, and null handling supported by the release. Invalid schema assumptions surface as ingestion failures.
Use versioned collections for incompatible model or schema changes. Backfill and evaluate the new collection before routing queries to it.
Use insert for new entities and documented upsert behavior for replacements. Repeated inserts should not be treated as a portable uniqueness-enforcement strategy.
Search by a compatible vector and request only needed output fields. Query-by-filter and nearest-neighbor search answer different questions.
Combine scalar filters with ANN retrieval and test selective predicates. Filter expression construction must use trusted fields and safely encoded values.
Milvus is a retrieval engine rather than a general relational reporting system. Verify supported scalar aggregation features and retain authoritative summaries elsewhere.
Batch ingestion, monitor indexing, and checkpoint accepted records. Loading large collections can require significant memory beyond raw vectors.
Inspect search latency with index type, parameters, filter selectivity, and load state. Recall is part of correctness when evaluating approximate execution.
Select supported index types and metrics deliberately. Search-time exploration parameters trade recall for latency and must be tuned against a fixed evaluation set.
Collection loading and internal caching are not application result caches. A result cache still needs tenant, model, and corpus-version awareness.
Partitions or partition keys can narrow search scope when supported. Avoid creating unnecessary tiny partitions or concentrating all traffic on one tenant.
Benchmark warm and cold/load scenarios separately. Include index build time, ingestion lag, and concurrent search rather than only steady-state latency.
Milvus exposes consistency options; choose the one matching visibility requirements. Do not infer immediate global visibility from an acknowledged insert alone.
Use application versioning to prevent stale re-embedding jobs replacing current entities. Multi-entity document publication needs its own readiness contract.
Replica and availability capabilities vary by deployment. A Lite file or single server cannot validate distributed failover promises.
Use the backup workflow appropriate to the deployment and retain source manifests. Test restoring collections, schemas, indexes, and search readiness.
Classify dimension errors separately from unavailable services. Retry ingestion with a deliberate upsert/deduplication policy and reconcile partial batches.
Enable supported authentication/authorization on server deployments and isolate local data files. Scalar tenant filters must come from trusted authorization logic.
Track loaded memory, search latency, ingestion backlog, index state, and relevance samples. A service can respond while the intended collection is not searchable.
Budget vectors, scalar data, indexes, loaded replicas, and build/compaction headroom. Index memory can exceed the raw float32 payload significantly.
Rebuild into a parallel collection when changing embedding dimensions or index strategy incompatibly. Validate recall and filters before cutover.
Document deployment mode, index parameters, consistency level, and source rebuild path. Rehearse loading and restoring before setting availability targets.
`,
    vectorLabs(
      "Milvus Lite",
      "Python dependency: pymilvus with supported Milvus Lite runtime\nLocal URI: course_vectors.db (disposable file)\nCollection: course_chunks; dimension: 3\nDefault quick-setup metric must be verified for your SDK release.",
      "from pymilvus import MilvusClient\nclient = MilvusClient('course_vectors.db')\nif not client.has_collection('course_chunks'):\n client.create_collection(collection_name='course_chunks', dimension=3)\nclient.upsert(collection_name='course_chunks', data=[\n {'id':1, 'vector':[1,0,0], 'tenant':'t1'},\n {'id':2, 'vector':[0,1,0], 'tenant':'t1'}\n])",
      "# Continue with client from the ingestion example.\nprint(client.search(collection_name='course_chunks', data=[[1,0,0]],\n filter='tenant == \"t1\"', limit=2, output_fields=['tenant']))",
    ),
  ),
  weaviate: profile(
    "https://docs.weaviate.io/weaviate",
    "Use Weaviate concepts for object properties, vector search, and hybrid lexical/semantic retrieval. The labs specify API-neutral request contracts so client-version setup remains explicit.",
    `
Weaviate combines stored objects and vector retrieval with lexical search capabilities. A configured vectorizer and self-provided vectors are different ingestion modes.
Collections contain objects and vector indexes alongside property indexing. Deployment topology and enabled integrations affect write, search, and availability behavior.
Prepare a supported local or managed Weaviate deployment and a matching client. Configure a self-provided-vector collection for the three-dimensional toy exercise.
Objects have properties and identifiers plus vector representations. Named vectors can express different embedding spaces, each needing compatible queries.
Use collection configuration, query metadata, and retrieval evaluation. Check vectorizer errors separately from object persistence and query failures.
Keep chunk text, source ID, tenant scope, and model version traceable. Object references should serve real access needs rather than mimic every relational join.
Use stable UUIDs or a deterministic UUID mapping from source/chunk identity. Keep the mapping consistent across reimports and deletions.
References between objects are not a substitute for an authorization or source-integrity policy. Define orphan handling and whether queries traverse references.
Explicitly configure property types and vector settings. Automatic schema inference can conceal ingestion inconsistencies in a learning or production pipeline.
Use compatible property additions and parallel collections for new embedding spaces. Evaluate named-vector changes without mixing incompatible query encoders.
Insert or update objects using the selected client's documented semantics. When providing vectors yourself, update them when text changes.
nearVector uses an explicit vector; nearText depends on a configured compatible vectorizer. Choose deliberately rather than assuming the two accept identical inputs.
Combine filters with vector retrieval and enforce tenant context server-side. Multi-tenancy configuration changes how objects are isolated and addressed.
Aggregation queries and nearest-neighbor queries have different scopes. Avoid interpreting a top-k result count as the full number of matching documents.
Batch APIs can report object-level failures after submission. Inspect and reconcile every failed object and account for embedding-provider throttling.
Measure vector and lexical retrieval separately before tuning hybrid search. Ranking fusion quality must be evaluated on representative questions.
HNSW and other supported index choices trade build cost, memory, and retrieval behavior. Inverted property indexes support lexical/filter workloads separately.
Cache query embeddings by vectorizer/model version. Hybrid result caches also depend on lexical settings, fusion configuration, and corpus changes.
Shards and tenant isolation influence placement and workload distribution. High-volume tenants need capacity planning beyond simply enabling multi-tenancy.
Tune hybrid balance and vector search parameters using relevance labels, recall, and latency. A score shift does not necessarily mean user-perceived quality improved.
Consistency behavior depends on replication and deployment settings. Confirm read/write options and multi-object guarantees rather than assuming SQL transactions.
Concurrent object updates and re-vectorization need version coordination. A late embedding result must not overwrite a newer source document silently.
Replication factor and consistency settings affect availability and freshness. Test the selected topology; a local single-node tutorial proves neither.
Use the supported backup backend and include collection configuration and vectorizer dependencies. Rebuilding requires source data and the same model versions.
Handle failed batch objects, unavailable vectorizers, and partial ingestion separately. Preserve IDs and a manifest so retries can repair incomplete documents.
Configure authentication, authorization, and tenant isolation appropriately. A similarity filter must not be the sole defense against unauthorized collection access.
Monitor object ingestion, vectorization failures, query latency, shard health, and relevance. A text insert can succeed while downstream retrieval quality remains poor.
Include object text, property indexes, vector indexes, replicas, and embedding-provider capacity. Hybrid retrieval maintains more than a raw vector array.
Shadow queries against a new collection or vector configuration and compare lexical/semantic behavior. Test deletions and tenant filters before switching traffic.
Version collection configuration, vectorizer models, hybrid settings, and evaluation datasets. Rehearse provider failure and restoring a complete searchable collection.
`,
    vectorLabs(
      "Weaviate",
      "Create disposable collection CourseChunk.\nConfigure self-provided vectors and properties: text, source, model.\nChoose cosine distance; enable an explicit tenant strategy.\nUse the official client matching the deployment.",
      "API-neutral write contract (not executable code):\nobject UUID a → vector [1,0,0], text 'alpha', source 'doc-a'\nobject UUID b → vector [0,1,0], text 'beta', source 'doc-b'\nIn a real request use valid stable UUIDs and authorized tenant context.",
      "API-neutral query contract (not executable code):\ncollection: CourseChunk\noperator: nearVector\nvector: [1,0,0]\nlimit: 2\nreturn: source and distance\ntenant: trusted tenant context",
    ),
  ),
  chroma: profile(
    "https://docs.trychroma.com/docs/overview/introduction",
    "Use Chroma collections for an application retrieval prototype. Python examples supply embeddings explicitly and use PersistentClient; no default embedding model download is required.",
    `
Chroma stores embeddings, documents, and metadata for retrieval applications. Distinguish an embedded local client, a server, and a managed deployment when discussing operations.
A client addresses collections and their indexes. Local persistence is a filesystem responsibility; a client library by itself does not provide high availability.
Install a compatible chromadb package and choose an isolated persistence directory. Record the SDK version and verify collection persistence after reopening the client.
Collections group IDs, vectors, documents, and metadata under compatible embedding rules. Treat embedding dimension and model version as explicit contracts.
Use collection count/get/query operations and application evaluation traces. Inspect persistence paths and client mode before diagnosing missing data.
Store one chunk per stable ID with source and tenant metadata. Keep original documents authoritative so the collection can be rebuilt and audited.
IDs are unique within a collection. Use deterministic source/chunk IDs so upsert and deletion can reconcile repeated ingestion.
Metadata references do not enforce source existence or cross-collection relations. Maintain a manifest to remove obsolete chunks after document changes.
Use supported metadata types and consistent embedding dimensions. A collection's compatible dimension is not a guarantee that two embedding models share meaning.
Create a parallel collection for a different embedding model. Backfill and compare retrieval results before switching the application's collection name.
add creates records while upsert handles insert-or-update workflows. When embeddings are supplied manually, keep text and vector replacements synchronized.
query finds nearby embeddings; get retrieves by IDs or filters. query_texts requires a configured embedding function, while query_embeddings accepts explicit vectors.
Use where filters for metadata and supported document filters for content. Tenant metadata must be injected or validated by trusted application code.
Collection counts are useful for ingestion checks, not proof of semantic completeness. Top-k retrieval should not be used to calculate authoritative business totals.
Use bounded batches and stable IDs. Inspect exceptions and retain checkpoints so partially completed source documents can be repaired.
Measure latency with realistic collection size and filters. Exact-neighbor comparison reveals missed candidates that a successful query call cannot expose.
Index configuration and modification options depend on the installed release and deployment. Check supported settings before copying older HNSW configuration examples.
Cache embeddings by source/model version and queries by authorization scope. Local client reuse can save setup overhead but is not a result-cache policy.
Collection-per-tenant and shared-collection filtering have different operational trade-offs. Neither removes the need for authorization at the service boundary.
Benchmark ingestion, persistence, query latency, and memory together. A tiny in-memory example is not a production capacity measurement.
Do not assume relational multi-record transaction semantics across ingestion calls. Publish a document as ready only after its expected chunks are verified.
Coordinate concurrent source updates in the application. A stale upsert can replace a newer embedding if version ordering is not enforced.
Local PersistentClient storage is not a replicated cluster. Availability, backup, and failover plans must match the actual Chroma deployment mode.
Use a deployment-supported consistent backup approach. Copying actively changing local storage files without a consistency plan is not a verified restore strategy.
Retry with stable IDs and reconcile a source manifest. Treat dimension/type errors as invalid input rather than endlessly retrying them.
Protect the persistence directory and put authenticated authorization around network access. Do not infer security features from local collection filtering alone.
Track source-to-index lag, query errors, count changes, missing IDs, and relevance samples. File existence does not prove the collection is complete.
Budget vectors, documents, metadata, indexes, and persistence overhead. Evaluate growth with representative data rather than extrapolating a two-record example.
Validate metadata, distances, embedding function, and model versions when migrating clients or servers. Compare fixed queries before changing the production path.
Record persistence location, client mode, embedding contract, and rebuild script. Test process restart, deleted documents, and unauthorized retrieval explicitly.
`,
    vectorLabs(
      "Chroma",
      "Python dependency: chromadb\nClient: PersistentClient(path='./course_chroma')\nCollection: course_chunks\nEmbeddings supplied explicitly; all have dimension 3.",
      "import chromadb\nclient = chromadb.PersistentClient(path='./course_chroma')\ncollection = client.get_or_create_collection('course_chunks', embedding_function=None)\ncollection.upsert(ids=['doc-a','doc-b'], embeddings=[[1,0,0],[0,1,0]],\n documents=['alpha','beta'], metadatas=[{'tenant':'t1'},{'tenant':'t1'}])",
      "# Continue with collection from the ingestion example.\nprint(collection.query(query_embeddings=[[1,0,0]], n_results=2,\n where={'tenant':'t1'}, include=['documents','distances']))",
    ),
  ),
};
