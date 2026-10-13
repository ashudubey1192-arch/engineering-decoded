const labels = {
  'Follow the token-to-token computation': ['Encode text', 'Mix context', 'Score candidates', 'Append token'],
  'Separate probabilities from a decoding policy': ['Distribution', 'Top-k filter', 'Top-p filter', 'Normalize'],
  'Compare representations in the same space': ['Documents', 'Query', 'Aligned vector', 'Orthogonal vector', 'Real embeddings'],
  'Preserve meaning while splitting documents': ['Source document', 'First chunk', 'Second chunk', 'Provenance'],
  'Retrieve evidence before composing an answer': ['Question', 'Retrieve & filter', 'Rank & assemble', 'Grounded answer'],
  'Keep model suggestions separate from authority': ['Proposed call', 'Validate access', 'Approval boundary', 'Execute & record'],
  'Specify a checkable response contract': ['Task', 'Allowed labels', 'Output contract', 'Validate output', 'Recover'],
  'Learn from data without evaluating on the answer key': ['Split data', 'Fit preprocessing', 'Train & select', 'Held-out test', 'Inspect slices'],
  'Choose a metric that matches the error cost': ['Class balance', 'Baseline result', 'Error cost'],
  'Define the unit of observation': ['Prediction goal', 'Available feature', 'Leaking feature', 'Time split'],
  'Operate a model as a changing dependency': ['Release bundle', 'Canary', 'Measure', 'Recover'],
  'Bound failures and retries': ['Deadline', 'First attempt', 'Backoff', 'Second attempt', 'Permanent error'],
  'Bound concurrent work': ['Arrival', 'Bounded workers', 'Free a slot', 'Backpressure'],
  'Make state transitions predictable': ['Start loading', 'Success path', 'Failure path', 'Stale response'],
  'Define a request contract': ['Success case', 'Missing record', 'Invalid input', 'Unauthorized'],
  'Validate data at runtime boundaries': ['Valid input', 'Range check', 'Type check', 'Required field'],
  'Check the action and the resource': ['Ownership', 'Own document', 'Other document', 'Admin policy'],
  'Design around a concrete access pattern': ['Query', 'Index', 'Measure', 'Boundary cases'],
};

export function getAiTrace(mechanism) {
  return mechanism.example.split('\n').filter(Boolean).map((text, index) => ({
    title: labels[mechanism.title]?.[index] || ['Evaluation setup', 'Billing example', 'Technical example', 'Other example', 'Invalid output'][index] || `Case ${index + 1}`,
    text,
  }));
}

