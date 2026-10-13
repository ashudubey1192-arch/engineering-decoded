// Each row is an authored statement with one missing concept, followed by
// three mutually exclusive distractors. Explanations restore the complete fact.
const sets = {
  'Follow the token-to-token computation': [
    ['A language model first represents text as {token IDs}.', 'whole documents', 'database rows', 'HTTP status codes'],
    ['Embeddings convert token IDs into {vectors}.', 'permissions', 'citations', 'timeouts'],
    ['Sequence order is supplied through {positional information}.', 'temperature alone', 'an access policy', 'a retry limit'],
    ['Attention combines information from {allowed context positions}.', 'all private documents automatically', 'only the final answer', 'future tokens that have not been generated'],
    ['After selecting a token, autoregressive generation {appends it and repeats}.', 'restarts training', 'verifies every claim', 'discards the entire context'],
  ],
  'Separate probabilities from a decoding policy': [
    ['For A=.60, B=.25, C=.10, D=.05, top-k with k=2 retains {A and B}.', 'A only', 'A, B and C', 'all four candidates'],
    ['For A=.60, B=.25, C=.10, D=.05, top-p with p=.90 retains {A, B and C}.', 'A only', 'A and B', 'B, C and D'],
    ['Temperature rescales {model scores before normalization}.', 'document access permissions', 'the training dataset size', 'the number of model parameters'],
    ['After filtering candidates, sampling uses {renormalized probabilities}.', 'the original probabilities without adjustment', 'equal scores for all vocabulary tokens', 'document timestamps'],
    ['Lower randomness {does not guarantee factual correctness}.', 'guarantees truthful output', 'eliminates the need for evaluation', 'authorizes tool calls'],
  ],
  'Compare representations in the same space': [
    ['Cosine similarity between query [1,0] and document [1,0] is {1}.', '0', '-1', '2'],
    ['Cosine similarity between query [1,0] and document [0,1] is {0}.', '1', '-1', '2'],
    ['Query and document embeddings must use {compatible representations}.', 'only matching text lengths', 'unrelated model versions', 'different coordinate systems'],
    ['A similarity score provides {a ranking signal}.', 'proof that a claim is true', 'permission to read a document', 'a guarantee of freshness'],
    ['Changing embedding models requires {re-embedding and re-evaluating the index}.', 'keeping all old vectors unchanged', 'only changing a display label', 'disabling retrieval tests'],
  ],
  'Preserve meaning while splitting documents': [
    ['Document chunks should preserve {meaningful boundaries}.', 'only equal character counts', 'only the final paragraph', 'random byte boundaries'],
    ['Chunk overlap can preserve context but adds {duplication and storage cost}.', 'new ground-truth labels', 'automatic authorization', 'guaranteed factuality'],
    ['A chunk should retain {document identity and provenance}.', 'only its text length', 'only a generated answer', 'no link to its source'],
    ['Separating a condition from its exception can produce {misleading retrieved evidence}.', 'a guaranteed correct answer', 'a smaller embedding dimension', 'automatic access control'],
    ['A useful chunking test includes {tables, exceptions, and cross-section questions}.', 'only document counts', 'only storage prices', 'only one easy keyword query'],
  ],
  'Retrieve evidence before composing an answer': [
    ['A grounded RAG answer is composed after {retrieving relevant evidence}.', 'changing the model weights for each query', 'discarding source passages', 'removing the user question'],
    ['Retrieved passages must be filtered by {caller access and relevant version}.', 'font size alone', 'answer length alone', 'the model temperature alone'],
    ['Retrieval quality and answer quality should be {measured separately}.', 'treated as the same metric', 'inferred from HTTP success', 'ignored when text is fluent'],
    ['A citation is useful only when the passage {exists and supports the claim}.', 'has a plausible-looking URL', 'uses the same font as the answer', 'contains more tokens than the question'],
    ['When supporting evidence is missing, the system should {state that evidence is insufficient}.', 'invent a source', 'silently present a guess as grounded', 'grant broader access automatically'],
  ],
  'Keep model suggestions separate from authority': [
    ['A model-proposed tool call must be authorized by {trusted application code}.', 'a retrieved document', 'the tool description alone', 'the generated argument text'],
    ['Tool-call arguments need {schema and resource validation}.', 'only fluent wording', 'only a longer context window', 'only a lower temperature'],
    ['Instructions found in retrieved pages remain {untrusted data}.', 'administrator commands', 'new user authorization', 'a replacement for application policy'],
    ['Execution limits belong in {trusted orchestration code}.', 'only a prompt sentence', 'the tool result text', 'an external document heading'],
    ['A model refusal is {not a substitute for server-side authorization}.', 'a complete authorization system', 'proof that every tool call is safe', 'permission to skip argument checks'],
  ],
  'Specify a checkable response contract': [
    ['A useful prompt states task, context, constraints, and {expected output}.', 'private credentials', 'unbounded tool permissions', 'an unrelated benchmark'],
    ['A classifier with labels billing, technical, other must reject {an output outside that label set}.', 'the billing label', 'the technical label', 'the other label'],
    ['Syntactically valid JSON {can still contain semantically wrong values}.', 'guarantees a correct classification', 'eliminates all refusals', 'proves the source is trustworthy'],
    ['Compare prompt versions using {the same evaluation set and scoring rubric}.', 'a different easy example for each version', 'only response length', 'only the author’s preference'],
    ['Malformed output needs {a bounded retry or a review path}.', 'unlimited retries', 'silent acceptance', 'automatic permission expansion'],
  ],
  'Learn from data without evaluating on the answer key': [
    ['Training adjusts parameters to reduce {a loss on training examples}.', 'the number of test examples', 'the validation set size', 'the number of documented assumptions'],
    ['Model selection should use {the validation set}.', 'the final test set repeatedly', 'production secrets', 'only the training score'],
    ['The held-out test set estimates {generalization after choices are fixed}.', 'which setting to try next repeatedly', 'the exact training gradient', 'which examples to remove to improve the score'],
    ['Preprocessing statistics should be fitted on {training data only}.', 'all splits together', 'the test set only', 'future outcomes'],
    ['A simple baseline tests whether {extra complexity adds predictive value}.', 'the model has the most parameters', 'the test set can be reused for tuning', 'all possible errors have disappeared'],
  ],
  'Choose a metric that matches the error cost': [
    ['With 95 negative and 5 positive cases, an always-negative model has {95% accuracy}.', '5% accuracy', '100% accuracy', '0% accuracy'],
    ['That always-negative model has {0% positive recall}.', '95% positive recall', '100% positive recall', '5% positive recall'],
    ['Metrics should reflect {the task and the cost of different errors}.', 'only the largest possible score', 'only model size', 'only training speed'],
    ['Aggregate quality can hide {failure on important subgroups}.', 'the exact cause of every error', 'perfect calibration', 'a guarantee of equal performance'],
    ['An automated judge needs {validation against human review}.', 'no evaluation of its own', 'only a convincing explanation', 'only a larger token budget'],
  ],
  'Define the unit of observation': [
    ['A prediction feature must be available {at prediction time}.', 'only after the outcome', 'only after test scoring', 'only during manual error correction'],
    ['A cancellation reason recorded afterward is {future-information leakage}.', 'a valid advance signal', 'an independent test metric', 'a safe preprocessing statistic'],
    ['Related rows from one customer may require {a group-based split}.', 'placing duplicates in every split', 'sorting only by label', 'training on the test labels'],
    ['To predict future months, a useful evaluation can train earlier and {test on later months}.', 'train on future outcomes', 'shuffle future labels into training', 'reuse the same rows as the test set'],
    ['Reproducible datasets record {provenance and transformations}.', 'only the final score', 'only a model nickname', 'only the number of notebooks'],
  ],
  'Operate a model as a changing dependency': [
    ['A release bundle should version model, prompt, configuration, and {preprocessing or retrieval dependencies}.', 'only its logo', 'only the HTTP port', 'only the release author'],
    ['A canary release initially uses {a limited representative traffic slice}.', 'all traffic without observation', 'only fabricated success cases', 'no observable requests'],
    ['A successful HTTP response {does not prove answer correctness}.', 'proves the answer is factual', 'proves fairness across groups', 'eliminates model drift'],
    ['Logging full prompts can expose {private data}.', 'only public documentation', 'only aggregate counters', 'only latency statistics'],
    ['A rollback must restore {a compatible release bundle}.', 'only an arbitrary version string', 'only a dashboard title', 'only the newest prompt with the oldest model'],
  ],
  'Bound failures and retries': [
    ['A timeout means {the caller stopped waiting}.', 'the operation definitely never happened', 'the operation definitely succeeded', 'the request was never sent'],
    ['Retries should target {safe transient failures}.', 'every validation error', 'every permission denial', 'all non-idempotent writes blindly'],
    ['Retry delays should use bounded backoff with {jitter}.', 'zero delay forever', 'a growing number of duplicate writes', 'disabled deadlines'],
    ['Retries at multiple layers can {multiply traffic during outages}.', 'guarantee lower load', 'eliminate all failures', 'make every write idempotent'],
    ['After a payment timeout, reuse {the original idempotency key}.', 'a new payment identity every time', 'an unrelated customer ID', 'no request identity'],
  ],
  'Bound concurrent work': [
    ['With 200 jobs and a worker limit of 8, at most {8 jobs run concurrently}.', '200 jobs run concurrently', '192 jobs run concurrently', 'no jobs run'],
    ['When a worker finishes, it {frees a slot}.', 'doubles the worker limit', 'discards all waiting jobs', 'removes every timeout'],
    ['A full bounded queue should trigger {rejection or backpressure}.', 'unlimited memory allocation', 'unlimited extra workers', 'silent success for dropped work'],
    ['Parallelism means work {executes simultaneously}.', 'always uses a single worker', 'never shares resources', 'never needs synchronization'],
    ['More workers can hurt throughput through {contention and downstream saturation}.', 'guaranteed infinite capacity', 'automatic removal of all locks', 'zero context-switching cost'],
  ],
  'Make state transitions predictable': [
    ['In the example, idle + LOAD becomes {loading}.', 'ready', 'failed', 'deleted'],
    ['Loading + SUCCESS(data) becomes {ready(data)}.', 'idle without data', 'failed(data)', 'loading forever'],
    ['Loading + FAILURE(error) becomes {failed(error)}.', 'ready(error)', 'successful', 'a second hidden request'],
    ['A stale response should {not overwrite a newer request result}.', 'always win', 'erase the newest result', 'restart all completed requests'],
    ['A filtered count is usually {derived from items and the filter}.', 'stored as an unrelated source of truth', 'updated without the items', 'assumed never to change'],
  ],
  'Define a request contract': [
    ['An authorized GET for a missing order returns {404 in the example contract}.', '200 with invented data', 'an unrelated order', 'all orders'],
    ['Invalid quantities produce {a validation error}.', 'silent success', 'a permission grant', 'an internal data dump'],
    ['Unauthorized responses must expose {no protected data}.', 'the full record with a warning', 'all internal fields', 'another user’s record'],
    ['Contract tests check status and {response shape, meaning, and side effects}.', 'only indentation', 'only server branding', 'only response font'],
    ['Business rules belong in {a testable service}.', 'only display formatting', 'only an HTTP status label', 'an accidental internal response object'],
  ],
  'Validate data at runtime boundaries': [
    ['A quantity of -1 should fail {range validation}.', 'valid positive-quantity validation', 'an ownership transfer', 'a successful order creation'],
    ['A quantity of "two" should fail {type validation}.', 'successful numeric validation', 'a cache lookup only', 'a model training step'],
    ['An empty input object fails {required-field validation}.', 'successful quantity validation', 'a retry budget check only', 'a database index check only'],
    ['A compiler annotation {does not validate runtime JSON}.', 'guarantees external data validity', 'replaces every boundary check', 'automatically rejects every malformed response'],
    ['Validation feedback should be {actionable without exposing sensitive internals}.', 'a full private stack trace', 'a silent success response', 'a dump of credentials'],
  ],
  'Check the action and the resource': [
    ['Authorization checks the principal, action, context, and {resource}.', 'only button visibility', 'only page title', 'only browser theme'],
    ['Resource authorization must be enforced {on the server}.', 'only in hidden buttons', 'only in CSS', 'only in a tooltip'],
    ['Alice requesting Bob’s private document should be {denied}.', 'allowed because she is logged in', 'allowed because she knows the URL', 'allowed because the identifier exists'],
    ['The default access policy should be {deny unless explicitly allowed}.', 'allow every logged-in user', 'allow every known URL', 'trust every model suggestion'],
    ['Cross-user tests request {another user’s real resource identifier}.', 'only the current user’s home page', 'only a nonexistent ID', 'only the sign-in form'],
  ],
  'Design around a concrete access pattern': [
    ['An index improves reads at a cost to {writes and storage}.', 'only text readability', 'only user interface color', 'only code comments'],
    ['For customer orders sorted by date, the example index is {(customer_id, created_at)}.', '(font_size, color)', '(temperature, top_p)', '(prompt, token_count)'],
    ['Before adding indexes, inspect {the query plan and measured workload}.', 'only the table name', 'only the database logo', 'only an unrelated benchmark'],
    ['Equal timestamps need {a stable tie-breaker for pagination}.', 'random ordering each request', 'no secondary ordering', 'duplicate records on every page'],
    ['Query values should be kept separate from syntax using {parameter binding}.', 'raw string concatenation', 'unescaped interpolation', 'user-supplied SQL fragments'],
  ],
  workflow: [
    ['In the support classifier, "I was charged twice" has label {billing}.', 'technical', 'other', 'invalid'],
    ['In the support classifier, "The app will not open" has label {technical}.', 'billing', 'other', 'invalid'],
    ['In the support classifier, "Hello" has label {other}.', 'billing', 'technical', 'invalid'],
    ['A prediction outside the allowed labels is {invalid}.', 'automatically correct', 'a new permitted label', 'an evaluation success'],
    ['Reliable improvement is measured on {unchanged held-out examples}.', 'only examples used to tune the system', 'different easy examples each time', 'only fluent responses'],
  ],
};

export function getAiConceptQuestions(mechanism, article) {
  const rows = sets[mechanism.title] || (mechanism.title.endsWith('connect the concept to a complete workflow') ? sets.workflow : null);
  if (!rows) throw new Error(`Missing AI exercises: ${mechanism.title}`);
  const seed = [...article.slug].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return rows.map(([statement, ...wrong], index) => {
    const correct = statement.match(/\{([^}]+)\}/)[1];
    const answer = (seed + index) % 4;
    const options = [...wrong];
    options.splice(answer, 0, correct);
    return { prompt: `Complete the statement from this lesson’s worked example.\n\n${statement.replace(/\{[^}]+\}/, '____')}`, options, answer, explanation: statement.replace(/[{}]/g, '') };
  });
}
