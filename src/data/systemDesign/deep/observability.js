import { deep } from "../schema.js";

export default {
  "observability--three-pillars-of-observability": deep({
    anim: ["From an alert to the cause in three moves", "a:Alert | m:Metrics | t:Traces | l:Logs | f:Cause", [
      ["a>m", "p99 high", "An alert fires: checkout p99 rose from 300 ms to 4 s. The metric says **that** something is wrong, and since when.", "m=p99 4 s since 10h02"],
      ["m", "by region", "Splitting by label shows: only region EU, only checkout.", "m=EU checkout"],
      ["m>t", "open a slow one", "An exemplar links to one slow request. The trace says **where** the time goes.", "t=tax call 3.6 s"],
      ["t>l", "trace id 8c1", "Logs of that trace id on the tax service say **why**.", "l=retrying DNS"],
      ["l>f", "DNS timeout", "A DNS change at 10:01 made the first lookup time out.", "f=+DNS change"],
      ["l", "logs first?", "Starting with logs would mean searching through billions of lines without knowing service, time or request.", "l=needle found"],
    ]],
    more: [
      ["Cost shapes", "Metrics: cheap, fixed by cardinality. Traces: moderate, controlled by sampling. Logs: grow with traffic, often the largest bill."],
      ["Monitoring and observability", "Monitoring answers questions you prepared. Observability lets you ask new ones without shipping new code, thanks to rich context on events."],
      ["Connect them", "Same service names, same labels, trace id in logs, exemplars on metrics. Without links you have three separate tools."],
    ],
    use: "Any system with more than one process.",
    avoid: "Collecting everything without using it. Each signal needs a question that it answers.",
    answer: "Metrics are cheap and cover everything, so they reveal that and when something is wrong. A trace narrows it to the service and call. Logs of that request then explain the cause. Starting with logs means searching a huge volume without direction.",
    qa: [
      ["What is an exemplar?", "A sample trace id attached to a metric bucket. It lets you jump from a latency spike on a chart to an actual slow request."],
      ["What would you instrument first in a new service?", "Rate, errors and duration per endpoint, the same for each dependency, saturation of pools and queues, structured logs with trace id, and propagated traces."],
    ],
  }),
  "observability--logging-best-practices": deep({
    anim: ["A sentence against a structured event", "a:App | t:Text log, j:JSON log | s:Log search | e:Engineer", [
      ["a>t", "free text", "`Payment failed for user 42 after 3 tries: timeout`", "t=1 sentence"],
      ["e>s", "failures by bank?", "Question: how many timeouts per bank in the last hour?", "e=asks"],
      ["s>t", "regex...", "Text needs fragile patterns, and the bank is not mentioned at all.", "s=!cannot answer"],
      ["a>j", "fields", "`{event: payment_failed, user: 42, bank: B7, tries: 3, reason: timeout, trace: 8c1}`", "j=6 fields"],
      ["s>j", "group by bank", "With fields it is a filter and a group: answered in seconds.", "s=+B7 91%"],
      ["a>j", "redact card", "Card numbers and tokens are removed by the logger **before** anything is written.", "j=+no secrets"],
    ]],
    more: [
      ["Levels with meaning", "ERROR: someone should look. WARN: unexpected but handled. INFO: business events. DEBUG: off in production, switchable per request."],
      ["Log once", "Log an error where it is handled, not at each layer. Five copies of one stack trace hide everything else."],
      ["Control volume", "Sample repetitive successes, keep all errors, set retention by value, and alert on sudden growth of the volume."],
    ],
    use: "Explaining individual events and errors with context.",
    avoid: "Counting things (use metrics) or logging whole bodies and personal data.",
    answer: "JSON fields can be indexed, filtered and grouped directly (all timeouts for bank B7 by version). Free text must be parsed with fragile patterns, and changing the wording breaks the searches.",
    qa: [
      ["What must never be logged?", "Passwords, tokens, full card numbers, secrets, and personal data beyond what is needed. Use allow-lists of fields and automatic redaction."],
      ["How do you debug one customer in production?", "Enable debug logs dynamically for that user or trace id, for a limited time, rather than for the whole fleet."],
    ],
  }),
  "observability--log-aggregation": deep({
    anim: ["Logs survive the machine that wrote them", "a:Server A, b:Server B | g:Agents | q:Buffer | s:Central store | e:Engineer", [
      ["a>g", "stdout", "Services write to standard output. An agent on each machine reads and adds host and service.", "g=tagged"],
      ["g>q", "batch", "Agents send batches to a buffer, which absorbs spikes and store outages.", "q=buffered"],
      ["q>s", "index", "The store indexes time and labels and compresses the text.", "s=+all servers"],
      ["b", "server deleted", "Auto scaling deletes server B. Its local files are gone.", "b=!gone"],
      ["e>s", "trace 8c1", "One query shows lines from A and B in order, including the deleted B.", "e=+full story"],
      ["q", "burst x50", "An error loop writes 50x more. Rate limits per service protect the pipeline and the bill.", "q=~limited"],
    ]],
    more: [
      ["Index or not", "Full-text indexing is fast and expensive. Label-only indexing is cheap and scans text at query time. Choose by how you search."],
      ["Tiers", "Hot for days (fast), warm for weeks, cold object storage for months or for audit. Most queries are about the last 24 hours."],
      ["Delivery", "At-least-once with buffering on disk. Decide what happens when the buffer is full: block the app or drop logs. For most apps, drop."],
    ],
    use: "More than a few servers, or short-lived instances.",
    avoid: "Sending everything to the most expensive tier without retention rules.",
    answer: "With many servers a request touches several, instances come and go, and nobody can log in to each one. Aggregation gives one searchable place that survives the machines and can be ordered by time and trace id.",
    qa: [
      ["Push or pull for logs?", "Agents push, with local buffering. Pulling files from thousands of changing hosts is harder, and loses logs of deleted instances."],
      ["How do you reduce cost by 70%?", "Drop debug and health-check lines, sample successes, shorten retention, move to label-only indexing, turn counters into metrics, and give teams their own budget."],
    ],
  }),
  "observability--correlation-ids": deep({
    anim: ["One id through four hops, and a broken one", "g:Gateway | o:Orders | q:Queue | w:Worker | l:Logs", [
      ["g>o", "id r-77", "The gateway creates id r-77 (or continues a trusted one) and puts it in a header.", "o=r-77"],
      ["o>l", "log r-77", "Every log line automatically contains the id from the request context.", "l=r-77 x2"],
      ["o>q", "message, no id", "The developer forgets to put the id into the **message header**.", "q=!no id"],
      ["q>w", "process", "The worker has no id and creates a new one.", "w=~id r-91"],
      ["w>l", "error r-91", "The error is logged under r-91. Searching r-77 ends at Orders: the story is cut in two.", "l=!r-77 and r-91"],
      ["q>w", "header r-77", "Fix it in the shared messaging library, so that no one can forget: HTTP, queue, schedule, all carry the id.", "w=+r-77; l=+one story; q=+r-77"],
    ]],
    more: [
      ["Standards", "The W3C `traceparent` header carries trace id, parent span and sampling. Use it instead of home-made headers, and keep a business id (order id) as well."],
      ["Context propagation", "Async code loses thread-local data. Use the language's context mechanism and test that ids survive thread pools and callbacks."],
      ["Tell the user", "Show the request id on error pages. Support can then find the exact logs in seconds."],
    ],
    use: "Any request that crosses a process boundary.",
    avoid: "Trusting ids from outside without validation: they end up in logs and may be used for injection.",
    answer: "The id is the only link between the log lines of different services. If one hop does not pass it, everything behind that hop gets another id or none, so a search finds only the first part and the cause usually lies in the missing part.",
    qa: [
      ["Correlation id or trace id?", "A trace id belongs to one technical request with spans and timing. A correlation id may cover a whole business process across days, e.g. an order. Often you log both."],
      ["How do you propagate ids through a queue?", "In message headers, set by the producer library and restored into the context by the consumer library before the handler runs."],
    ],
  }),
  "observability--metrics-instrumentation": deep({
    anim: ["An average hides what p99 shows", "u:100 requests | h:Histogram:empty | a:Average, p:p99 | e:Engineer", [
      ["u>h", "98 x 50 ms", "Ninety-eight requests take 50 ms.", "h=98 fast"],
      ["u>h", "2 x 5000 ms", "Two requests take 5 seconds.", "h=98 fast 2 slow"],
      ["h>a", "149 ms", "Average: (98 x 50 + 2 x 5000) / 100 = 149 ms. It looks healthy.", "a=149 ms"],
      ["h>p", "5000 ms", "p99 is 5 seconds: one request in a hundred is terrible.", "p=!5000 ms"],
      ["e", "20 calls a page", "A page with 20 calls hits at least one slow call in about one third of the views: 1 - 0.98^20 = 33%.", "e=!33% of pages"],
      ["h>e", "buckets add up", "Histograms from all servers can be added and then evaluated. Averages of p99 values are **meaningless**.", "e=+true p99"],
    ]],
    more: [
      ["Types", "Counter (only up; use rates), gauge (current value), histogram (distribution in buckets). Choose buckets around your target, e.g. 100, 200, 300, 500 ms."],
      ["RED and USE", "Services: Rate, Errors, Duration. Resources: Utilisation, Saturation, Errors. These two lists cover most needs."],
      ["Cardinality", "Each label combination is a separate series. Never use user ids, URLs with ids or error texts as labels."],
    ],
    use: "Trends, alerts, capacity planning and SLOs.",
    avoid: "Explaining single requests, where traces and logs fit.",
    answer: "Averages are dominated by the many fast requests, so a small share of very slow ones barely moves them. p99 looks only at the slow tail, where users are suffering, and shows it immediately.",
    qa: [
      ["Why can't you average percentiles?", "A percentile has lost the distribution. The p99 of two servers depends on their volumes and full distributions, so merge histograms or sketches and compute it from those."],
      ["How do you keep metrics cheap?", "Bounded labels, drop unused series, longer scrape intervals for slow signals, recording rules for heavy queries, and downsampling of old data."],
    ],
  }),
  "observability--alerting-monitoring": deep({
    anim: ["A symptom alert and a cause alert", "s:Service | c:CPU alert 80%, e:Error alert 5% | o:On-call | u:Users", [
      ["s>c", "CPU 92%", "A batch job uses spare CPU at night.", "c=!fires"],
      ["c>o", "page at 03h00", "On-call is woken. Users notice nothing.", "o=~woken up; u=+happy"],
      ["o", "ignore it", "After ten false alarms people stop reacting: alert fatigue.", "o=!ignores alerts"],
      ["s>e", "errors 6%", "Another night CPU is 30%, but a bad config makes 6% of checkouts fail.", "s=!bad config; c=silent"],
      ["e>o", "page", "The **symptom** alert fires: users are hurt right now.", "e=!fires; o=+acts"],
      ["o>s", "roll back", "The alert links to a runbook, and the service is fixed in six minutes.", "s=+fixed; u=+happy"],
    ]],
    more: [
      ["Burn-rate alerts", "Alert when the error budget is being used too fast: 14x over 1 hour pages, 1x over 3 days opens a ticket. Two windows avoid flapping."],
      ["Each page needs an action", "If nobody can do anything, it is a dashboard or a ticket. Review every page weekly; delete or fix noisy ones."],
      ["Watch the watcher", "A dead man's switch alerts when monitoring itself stops sending. Probe from outside as well as inside."],
    ],
    use: "Waking a person for problems that hurt users and need action now.",
    avoid: "Paging on causes such as CPU, unless they reliably predict user harm (disk full in 4 hours).",
    answer: "5% errors means that users are failing now, whatever the cause. CPU of 80% may be perfectly fine (good utilisation), and many outages happen with low CPU. Symptom alerts find all causes and have few false alarms.",
    qa: [
      ["When is a cause-based alert right?", "When it predicts certain user harm with time to act: disk will be full, certificate expires in 14 days, replication stopped, quota nearly reached."],
      ["How do you reduce alert noise?", "Group related alerts, inhibit children when a parent fires, use durations and burn rates, route by owner, and remove alerts without actions."],
    ],
  }),
  "observability--dashboards-runbooks": deep({
    anim: ["An incident with and without preparation", "a:Alert | o:On-call | d:Dashboard, r:Runbook | s:Service:failing", [
      ["a>o", "checkout errors", "The alert says what is wrong and who is affected, with two links.", "o=10h02 paged"],
      ["o>d", "open link", "The dashboard shows errors by version, region and dependency, plus recent deploys.", "d=v2.4 at 10h00"],
      ["d>o", "only v2.4", "Errors began with version 2.4 and only there.", "o=10h04 knows"],
      ["o>r", "steps", "The runbook gives the tested command to roll back, and who to inform.", "r=rollback steps"],
      ["r>s", "roll back 2.3", "The person has never seen this service, yet acts safely at 3 a.m.", "s=+recovered"],
      ["o>r", "improve", "After the incident the runbook is updated and the step is automated.", "r=+automated; o=10h09 done"],
    ]],
    more: [
      ["Dashboard order", "Top: user impact and SLO. Then traffic, errors, latency. Then dependencies, then resources. A stranger should find the problem in a minute."],
      ["Runbook contents", "Meaning, impact, quick checks, safe mitigations with commands, escalation, links. Short: it is read under stress."],
      ["Keep it true", "Practise in game days, own it like code, link from the alert, and remove panels nobody uses."],
    ],
    use: "Every alert that can page someone.",
    avoid: "Walls of 80 charts or runbooks that say only 'restart it'.",
    answer: "The alert says that something is wrong, the dashboard shows where and since when, and the runbook tells what to do. With only one, the responder must still search for data or invent a fix under pressure.",
    qa: [
      ["When should a runbook become automation?", "When steps are deterministic, safe and repeated. Start with a script run by a person, then let the system run it with limits and logging."],
      ["What is the first thing to check in an incident?", "What changed: deploys, configuration, flags, traffic, dependencies. Most incidents follow a change, so show changes on the charts."],
    ],
  }),
  "observability--distributed-tracing": deep({
    anim: ["Reading a waterfall of spans", "g:Gateway:1200 ms | o:Orders:1150 ms | p:Pricing:90 ms, s:Stock:1000 ms | d:Stock DB:950 ms", [
      ["g>o", "trace 8c1 span 1", "The gateway starts a trace and passes its id. Its span lasts 1,200 ms in total.", "g=1200 ms"],
      ["o>p", "span 3", "Orders calls Pricing: 90 ms. Not the problem.", "p=+90 ms"],
      ["o>s", "span 4", "It calls Stock: 1,000 ms of 1,150 ms are spent here.", "s=!1000 ms"],
      ["s>d", "span 5 SELECT", "Inside Stock, one query takes 950 ms. The nested spans lead straight to it.", "d=!950 ms"],
      ["o", "1 after 2", "Pricing and Stock ran **one after the other**. In parallel it would have saved 90 ms more.", "o=~sequential"],
      ["d>g", "index added", "With an index the query takes 5 ms and the next trace shows it.", "d=+5 ms; s=+55 ms; o=+200 ms; g=+250 ms"],
    ]],
    more: [
      ["Sampling", "Head sampling decides at the start: cheap, but misses rare errors. Tail sampling decides after the trace is complete and keeps slow or failed ones, with more infrastructure."],
      ["Useful attributes", "Tenant, version, region, cache hit, retry number, query shape. They let you compare slow with fast traces automatically."],
      ["Async links", "A message consumer starts a new trace linked to the producer's span, so one batch of 1,000 messages does not become one monster trace."],
    ],
    use: "Latency and errors across services, finding N+1 calls and unexpected dependencies.",
    avoid: "As the only signal: sampled traces cannot give exact counts.",
    answer: "Each span has a start, a duration and a parent. Drawn as a waterfall, the child that fills most of its parent's time stands out, and you follow it down level by level to the service or query that dominates.",
    qa: [
      ["What breaks a trace?", "A hop that does not pass the context: a custom client, queue, thread pool, third party or proxy that strips headers. The trace then shows a gap or splits in two."],
      ["How much overhead does tracing add?", "Usually below 1-3% with sampling and batch export. The volume exported is the larger cost, so sample wisely and limit attributes."],
    ],
  }),
};
