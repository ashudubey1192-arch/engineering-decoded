import { lesson } from "../schema.js";

export default {
  "api-design--api-versioning": lesson({
    intro: "API versioning lets a contract change **without breaking clients you cannot update**. The best versioning strategy is needing a new version rarely.",
    scene: "A bank renames `amount` to `amount_cents` in its API. Its own app is updated the same day, but 40 partner systems and two million old phone apps are not. Payments of 100 euros become one euro for an afternoon.",
    parts: [
      ["What breaks clients", "Removing or renaming fields, changing types, units or meaning, new required inputs, stricter validation, changed defaults, sorting or error codes. Adding an optional input or an output field is normally safe, if clients ignore unknown fields."],
      ["Where to put the version", "All forms work; choose one and be consistent.", ["**Path** `/v2/orders`: visible, easy to route and cache.", "**Header** `Accept: application/vnd.shop.v2+json`: clean URLs, harder to test by hand.", "**Date** `Api-Version: 2026-11-01`: each client is pinned to the date it was built."]],
      ["Evolve, then version", "First add the new field beside the old, fill both, announce, measure use, and remove much later. Many changes never need a new version."],
      ["Run versions cheaply", "Keep **one** core implementation and translate old requests and responses at the edge. Copying the whole code for v1 doubles every bug fix."],
      ["Retire with care", "Announce dates, send `Deprecation` and `Sunset` headers, contact remaining callers by API key, do short planned brownouts, then switch off."],
    ],
    anim: ["Two versions, one core", "c1:Old client v1, c2:New client v2 | a:Adapter v1, b:Adapter v2 | k:Core | u:Usage report", [
      ["c1>a", "amount: 10.50", "The old client still sends euros as a decimal.", "a=translating"],
      ["a>k", "cents: 1050", "The v1 adapter converts to the core's model. The core knows only cents.", "k=1050 cents"],
      ["c2>b", "amount_cents: 1050", "The new client uses v2, and its adapter passes the value on.", "b=pass"],
      ["k>a", "cents: 1050", "On the way back, v1 converts the reply to the old form. Old clients never notice the change.", "a=10.50; c1=+works"],
      ["a>u", "count v1 by key", "Each v1 call is counted by API key.", "u=3 partners left"],
      ["u>c1", "sunset notice", "The last three partners are contacted and migrated.", "c1=moves to v2"],
      ["a", "removed", "The small adapter is deleted. The core is untouched.", "a=+gone; u=0 left"],
    ]],
    example: [
      ["Need", "Prices must support several currencies: `price: 10.5` becomes `{amount, currency}`."],
      ["Try additive", "Add `price_money: {amount: 1050, currency: 'EUR'}` and keep `price`."],
      ["Document", "Mark `price` as deprecated in the schema, and generate warnings in SDKs."],
      ["Measure", "Log which API keys still read or send `price` (or ask with field selection)."],
      ["Version if needed", "Only if `price` must disappear: publish v2, keep v1 for 12 months with an adapter."],
    ],
    use: "APIs used by clients you do not deploy yourself: partners, mobile apps, the public.",
    avoid: "Versioning internal APIs where all callers live in one repository: change them together.",
    mistakes: [["A version per endpoint mess", "v1 here, v3 there: nobody knows which combination works. Version the API as a whole or by date."], ["Silent meaning change", "Keeping the name and changing the unit is the worst break: nothing fails, the numbers are just wrong."], ["Never retiring", "Five live versions cost more than a careful migration programme."]],
    check: "You want to make the optional field `phone` required on POST /users. Is it breaking, and how would you introduce it?",
    answer: "Yes: requests that worked now fail. Keep it optional in v1 (perhaps prompting the user later), require it in v2, or require it only for new API keys from a given date. Announce, measure missing phones, and tighten when the share is near zero.",
    qa: [["How do you keep mobile apps compatible for years?", "Additive changes, tolerant readers, adapters at the edge, minimum supported version checks with a friendly upgrade screen, and usage metrics per app version."], ["How do contract tests help?", "Each consumer records what it needs, and the provider's build verifies all recordings. A breaking change fails in CI rather than in production."]],
    take: "Add freely, rename never in place, translate at the edge, and remove only what nobody calls.",
  }),
  "api-design--pagination-strategies": lesson({
    intro: "Pagination returns a long list in pieces. The choice between **offset** and **cursor** decides whether page 1,000 is fast and whether users see duplicates.",
    scene: "An activity feed uses `OFFSET`. While a user scrolls, ten new posts arrive at the top. Page 2 now repeats ten posts from page 1. Deep pages get slower and slower, until the database times out.",
    parts: [
      ["Offset pagination", "`LIMIT 20 OFFSET 40`. Simple, allows jumping to page N. The database must walk over and discard all skipped rows, and inserts or deletes shift everything."],
      ["Keyset (cursor) pagination", "`WHERE (created_at, id) < (last_created_at, last_id) ORDER BY created_at DESC, id DESC LIMIT 20`. With a matching index each page costs the same, and new rows do not shift old ones."],
      ["Opaque cursors", "Encode the last position in a token such as base64 of `{t, id}`. Clients should not read or build it, so that you can change its content later. Sign it if tampering matters."],
      ["Page size and end", "Set a default and a maximum. Fetch limit + 1 rows to know if there is a next page, without a COUNT."],
      ["Counting", "Exact totals over millions of rows are slow. Offer an estimate, 'more than 1,000', or none."],
    ],
    table: ["WHICH ONE?", ["Need", "Offset", "Cursor"], [["Jump to page 57", "Yes", "No"], ["Infinite scroll", "Duplicates or gaps", "Stable"], ["Deep pages", "Slower and slower", "Constant"], ["Any sort column", "Yes", "Needs an index and a tiebreaker"]]],
    anim: ["A new row arrives between two pages", "c:Client | a:API | o:Offset query, k:Cursor query | t:Rows:9 8 7 6 5 4", [
      ["c>a", "page 1 size 2", "The client asks for the first two rows, newest first.", "a=page 1"],
      ["a>o", "OFFSET 0", "It receives 9 and 8.", "c=has 9 8"],
      ["t", "insert 10", "A new row, 10, is inserted at the top.", "t=10 9 8 7 6 5"],
      ["a>o", "OFFSET 2", "Offset skips two rows (10 and 9) and returns 8 and 7: **8 appears twice**.", "o=!8 7"],
      ["a>k", "id < 8", "The cursor says: continue after 8. Row 10 does not matter.", "k=+7 6"],
      ["k>c", "7 6 next=6", "The client receives 7 and 6, plus a token for the next page.", "c=+has 9 8 7 6"],
      ["a>o", "OFFSET 100000", "At depth, offset reads and throws away 100,000 rows. The cursor still reads two.", "o=!100k rows read"],
    ]],
    example: [
      ["Choose the order", "Newest first, with the id as tiebreaker, because many rows share a timestamp."],
      ["Create the index", "`(user_id, created_at DESC, id DESC)` matches filter and order."],
      ["First page", "`WHERE user_id = 42 ORDER BY created_at DESC, id DESC LIMIT 21`: 20 rows plus one to detect more."],
      ["Build the token", "base64 of `{\"t\":\"2026-11-25T10:00:00Z\",\"id\":881}`, returned as `next`."],
      ["Next page", "Add `AND (created_at, id) < (token.t, token.id)`: 2 ms at any depth."],
    ],
    code: `GET /posts?limit=20
{ "items": [ ... ], "next": "eyJ0IjoiMjAyNi0xMS0yNVQxMDowMCIsImlkIjo4ODF9" }

GET /posts?limit=20&after=eyJ0Ijoi...

SELECT * FROM posts
WHERE user_id = 42
  AND (created_at, id) < ('2026-11-25 10:00', 881)
ORDER BY created_at DESC, id DESC
LIMIT 21;`,
    use: "Cursors for feeds, APIs, exports and anything that grows. Offset for small admin tables.",
    avoid: "Cursors when users must jump to arbitrary pages or sort by any column.",
    mistakes: [["No tiebreaker", "Sorting only by time loses or repeats rows that share the same timestamp."], ["Unlimited page size", "`limit=1000000` is a denial of service. Enforce a maximum."], ["Counting on every request", "The COUNT often costs more than the page itself, and its value is old a second later."]],
    check: "You page through orders sorted by `total` descending with a cursor containing only the last total. Two orders have the same total. What can go wrong, and how do you fix it?",
    answer: "With `total < last` the second order of equal total is skipped; with `<=` the first is repeated. Add a unique tiebreaker: sort and compare by `(total, id)` and put both in the cursor.",
    qa: [["How do you export millions of rows through an API?", "Cursor pages over a stable key, or an asynchronous export that writes a file. Do not use deep offsets. Optionally fix a snapshot time so that results are consistent."], ["How do you paginate a merged feed from several shards?", "Ask each shard for the next N after its own position, merge, return N, and keep one position per shard in the cursor."]],
    take: "Say where to continue, not how many to skip: a cursor stays fast and stable at any depth.",
  }),
  "api-design--api-error-handling": lesson({
    intro: "Good API errors tell the client three things: **what** went wrong, **whose** fault it is, and **what to do next**: fix, wait or give up.",
    scene: "An API returns `200 OK` with `{error: 'fail'}` for everything. Clients retry invalid requests forever, monitoring shows 100% success, and support cannot find any log. Nothing is broken in the code; the error contract is.",
    parts: [
      ["Use the status classes", "The class decides client behaviour.", ["**2xx** done. **4xx** your request is wrong: do not repeat it unchanged.", "**5xx** our problem: may be retried with backoff.", "**409** conflict, **422** invalid content, **429** too many, **503** try later."]],
      ["One error shape", "Use the same structure everywhere, for example problem details: `type`, `title`, `status`, `detail`, plus your own `code`, `errors` per field and `request_id`."],
      ["Stable codes, free text", "Programs branch on `code: CARD_DECLINED`. People read `detail`, which may change and be translated. Never make clients parse sentences."],
      ["Tell them when to retry", "`Retry-After` on 429 and 503, and a clear list of retryable codes. For unknown results (timeouts) demand an idempotency key."],
      ["Say little to attackers", "No stack traces, SQL or internal hosts. Log the details under the request id and return only that id."],
    ],
    table: ["WHAT SHOULD THE CLIENT DO?", ["Status", "Meaning", "Client action"], [["400 / 422", "Invalid request", "Fix input, show field errors"], ["401", "Not identified", "Refresh login"], ["403", "Not allowed", "Stop"], ["409", "State conflict", "Reload and merge"], ["429", "Too many requests", "Wait Retry-After"], ["500 / 502 / 504", "Server or upstream failed", "Retry if idempotent"], ["503", "Overloaded", "Back off and retry"]]],
    anim: ["Three errors, three reactions", "c:Client | a:API | v:Validator, p:Payment provider | l:Logs", [
      ["c>a", "POST qty = -1", "The client sends an invalid quantity.", "a=request r1"],
      ["a>v", "check", "Validation fails before any work is done.", "v=qty below 1"],
      ["a>c", "422 qty: min 1", "The answer names the field and the rule. The client shows it and does **not** retry.", "c=~fix input"],
      ["c>a", "POST qty = 1", "Corrected request.", "a=request r2"],
      ["a>p", "charge", "The payment provider times out.", "p=!timeout"],
      ["a>c", "503 retry in 2s", "Our side has a problem: retry later with the same idempotency key.", "c=~waits 2 s"],
      ["a>l", "r2 full detail", "The log keeps the provider's response and stack trace under r2. The client saw only the id.", "l=+r2 details"],
      ["c>a", "retry r3", "The retry succeeds, and the key prevented a double charge.", "c=+201; p=+ok"],
    ]],
    example: [
      ["Define codes", "`VALIDATION_FAILED`, `NOT_FOUND`, `VERSION_CONFLICT`, `RATE_LIMITED`, `UPSTREAM_UNAVAILABLE`."],
      ["Map in one place", "Domain exceptions are translated to status and body by one middleware."],
      ["Return field errors", "`errors: [{field: 'qty', code: 'MIN', min: 1}]`, all at once, not one at a time."],
      ["Attach the id", "`request_id: r2` in body and header, and in each log line."],
      ["Alert properly", "5xx counts against the SLO. 4xx is watched for sudden jumps, which may reveal a broken client release."],
    ],
    code: `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.shop.example/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_FAILED",
  "errors": [{ "field": "qty", "code": "MIN", "min": 1 }],
  "request_id": "r1"
}`,
    use: "Every API, from the first endpoint: clients build on your error contract.",
    avoid: "Inventing new status codes or using 200 for failures.",
    mistakes: [["Everything is 500", "Clients retry bad input for ever, and your error budget burns for their mistakes."], ["Leaking internals", "A stack trace shows frameworks, versions and table names to an attacker."], ["Partial success hidden", "For batch calls return a result per item (207 or a results list), not one overall status."]],
    check: "A client calls POST /transfer and receives 504. What must the API documentation say so that the client can act safely?",
    answer: "504 means the result is unknown: the transfer may or may not have happened. The client must retry with the same Idempotency-Key (or query the transfer by that key), with backoff, and must not create a new key.",
    qa: [["404 or 403 for someone else's object?", "404 hides that it exists and is usually preferred for private objects. Use 403 when existence is no secret. Be consistent, and make timing similar."], ["How do you design errors for gRPC or GraphQL?", "gRPC has standard codes plus typed details. GraphQL returns 200 with an errors list, so add a machine code in extensions, and monitor the body."]],
    take: "An error is part of the API: status for machines, code for programs, text for people, id for support.",
  }),
};
