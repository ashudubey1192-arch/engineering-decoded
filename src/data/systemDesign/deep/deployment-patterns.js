import { deep } from "../schema.js";

export default {
  "deployment-patterns--deployment-strategies-overview": deep({
    anim: ["One bad release, four strategies", "v:Bad v2 | a:All at once, r:Rolling, b:Blue-green, c:Canary | u:Users hurt", [
      ["v>a", "replace all", "All at once: every user gets the bug, and going back means deploying again.", "a=!100% users"],
      ["v>r", "1 of 10", "Rolling: the bug reaches 10% more users with each step until someone stops it.", "r=~10% then more"],
      ["v>b", "switch", "Blue-green: everyone moves at once, but switching back takes seconds.", "b=~100% for 2 min"],
      ["v>c", "1%", "Canary: 1% of users see it for 10 minutes while metrics are compared.", "c=+1% users"],
      ["c>u", "auto stop", "The canary's error rate is 5x the baseline, so it is stopped automatically.", "u=+1% affected"],
      ["v>u", "behind a flag", "With a feature flag, v2 can be deployed to everyone with the feature **off**. Deploy and release become separate decisions.", "u=+0% affected"],
    ]],
    more: [
      ["Blast radius x time", "Harm = share of users x severity x time until recovery. Each strategy reduces one of them: canary the share, blue-green the recovery time."],
      ["Compatibility is universal", "In every strategy except a full stop, old and new run together. APIs, messages and schema must work for both."],
      ["Choose by cost", "Blue-green doubles capacity for a while. Canary needs good metrics and traffic splitting. Rolling needs the least and is a reasonable default."],
    ],
    use: "Matching the strategy to risk, traffic volume and how quickly you can notice a problem.",
    avoid: "A canary with ten requests per hour: there is no signal to compare.",
    answer: "How do we limit how many users a bad version can harm, and for how long, i.e. how do we find out that it is bad and go back, while old and new versions coexist?",
    qa: [
      ["What is the difference between deploy and release?", "Deploy puts code into production. Release exposes it to users. Flags and routing let you deploy often and release carefully."],
      ["Which metrics decide a rollout?", "Error rate, latency percentiles, saturation, plus a business metric such as successful checkouts, compared with a control group at the same time."],
    ],
  }),
  "deployment-patterns--ci-cd-pipelines": deep({
    anim: ["A commit travels to production", "d:Commit | b:Build + test | a:Artifact store:empty | s:Staging | p:Production", [
      ["d>b", "push", "Every push triggers the same steps: compile, unit tests, lint, security scan.", "b=running"],
      ["b>d", "fail in 4 min", "A failing test comes back while the change is still fresh in the author's mind.", "d=~fix"],
      ["b>a", "image 9f2c", "On success **one** immutable artifact is built, signed and stored.", "a=9f2c; b=+green"],
      ["a>s", "deploy 9f2c", "The same artifact goes to staging, where integration and smoke tests run.", "s=+tests pass"],
      ["s>p", "approve?", "Continuous **delivery**: ready to go, a person presses the button. Continuous **deployment**: no button.", "p=canary 5%"],
      ["p", "metrics ok", "Automatic checks watch the canary, then continue to 100% or roll back.", "p=+100% 9f2c"],
    ]],
    more: [
      ["Build once", "Rebuilding per environment means testing something other than what you ship. Put differences in configuration."],
      ["Pipeline security", "It can deploy to production, so protect it: short-lived credentials, pinned dependencies, signed artifacts, reviewed workflow changes."],
      ["Four measures", "Deployment frequency, lead time, change failure rate and time to restore. Small batches improve all four together."],
    ],
    use: "Every project with more than one change per month.",
    avoid: "Long flaky pipelines: people stop trusting them and start skipping them.",
    answer: "Continuous Delivery keeps every change in a releasable state and a human decides when to deploy. Continuous Deployment deploys every change that passes the automated checks, without a manual step.",
    qa: [
      ["How do you speed up a 40-minute pipeline?", "Cache dependencies, run tests in parallel, test only what changed, move slow tests after merge, and fix flaky tests first."],
      ["What belongs before merge and what after?", "Before: fast checks giving confidence in the change. After: expensive end-to-end, performance and security tests, with automatic revert on failure."],
    ],
  }),
  "deployment-patterns--rolling-deployments": deep({
    anim: ["Updating three servers one by one", "lb:Balancer | a:Server A:v1, b:Server B:v1, c:Server C:v1 | q:Queue", [
      ["lb>a", "drain", "Stop new requests to A and let running ones finish (30 seconds).", "a=~draining"],
      ["a", "start v2", "Start the new version and wait until its readiness check passes.", "a=+v2 ready"],
      ["lb>a", "traffic", "A receives traffic. Now v1 and v2 serve **at the same time**.", "a=+v2"],
      ["a>q", "v2 message", "v2 writes a message with a new field. v1 workers must be able to ignore it.", "q=new field"],
      ["lb>b", "drain, update", "Continue with B only if the error rate is normal.", "b=+v2"],
      ["c", "v2 fails check", "C fails its readiness check. The rollout stops automatically with two good servers.", "c=!not ready"],
      ["lb>c", "fix or undo", "Either fix C, or roll all back one by one: slower than switching.", "c=+v2"],
    ]],
    more: [
      ["Surge and unavailable", "maxSurge adds extra capacity during the update; maxUnavailable says how much may be missing. Surge 1 and unavailable 0 keeps full capacity."],
      ["Pace", "Wait between steps long enough for problems to appear (memory leaks need minutes). Fast rollouts find bugs after they are everywhere."],
      ["Shutdown", "Handle the termination signal: fail readiness, finish requests, close connections, then exit."],
    ],
    use: "Stateless services with compatible changes: the default choice.",
    avoid: "Breaking changes or when instant rollback is required.",
    answer: "During the roll, some instances run the old and some the new version, sharing databases, queues and callers. A request or message created by one may be handled by the other, so APIs, events and schema must work with both.",
    qa: [
      ["How do you roll out a breaking API change?", "Expand and contract: add the new form, migrate callers, then remove the old form in a later release."],
      ["Why did errors appear during a rolling deploy although the new version is fine?", "Usually missing draining or readiness: requests went to a process that was stopping or not yet warmed up."],
    ],
  }),
  "deployment-patterns--blue-green-deployments": deep({
    anim: ["Switching and switching back", "u:Users | r:Router:to blue | b:Blue v1:live, g:Green v2:empty | d:Database", [
      ["g", "deploy v2", "Green is a full copy of production. Deploy v2 there while users stay on blue.", "g=v2 idle"],
      ["g>d", "smoke test", "Test green with real infrastructure, using internal requests.", "g=+tested"],
      ["r>g", "switch", "Change the router: all users move to green within seconds.", "r=to green; g=+live; b=idle v1"],
      ["u>g", "errors 8%", "A problem appears only under real traffic.", "g=!errors"],
      ["r>b", "switch back", "Blue is still running v1, warm. **Rollback is one routing change.**", "r=to blue; b=+live"],
      ["g>d", "shared data", "The database is shared, so v2's writes remain. Schema changes must be compatible with both versions.", "d=~v1 + v2 rows; g=idle"],
    ]],
    more: [
      ["Cost", "Double capacity during the release. In the cloud, create green for the release and delete blue after a safe period."],
      ["Sessions and caches", "Keep sessions outside the app. Warm green's caches before the switch, or it receives full traffic cold."],
      ["Connections", "Long-lived connections stay on blue after the switch. Drain them for a while or close them deliberately."],
    ],
    use: "Fast rollback, full testing in production conditions, infrequent larger releases.",
    avoid: "Incompatible database changes, or systems too large to duplicate.",
    answer: "The previous version is still running, so going back is a routing change taking seconds. With a rolling deployment the old version has been replaced on each server, so rollback means rolling out the old version again step by step.",
    qa: [
      ["How do you handle database migrations in blue-green?", "Expand first (additive, works with both), switch, and contract only after blue is retired."],
      ["How is blue-green different from canary?", "Blue-green moves everybody at once, with instant return. Canary moves a small share first to limit how many users see a problem. They can be combined."],
    ],
  }),
  "deployment-patterns--canary-releases": deep({
    anim: ["Automatic analysis stops a bad version", "r:Router:100% v1 | a:v1 stable, b:v2 canary:off | m:Analysis", [
      ["r>b", "1%", "One percent of users go to v2. The rest stay.", "r=1% v2; b=1%"],
      ["a>m", "baseline", "Compare v2 with v1 **at the same moment**, not with yesterday.", "m=v1 0.2% err"],
      ["b>m", "0.2% err", "After 10 minutes the results are alike: continue.", "m=+equal"],
      ["r>b", "10%", "Raise to 10%. Now rarer problems become visible.", "r=10% v2; b=10%"],
      ["b>m", "p99 3x", "At 10% the p99 latency is three times higher, although the average is normal.", "m=!p99 bad"],
      ["r>a", "0% v2", "Automatic rollback. At most 10% of users were affected for a few minutes.", "r=+100% v1; b=off"],
    ]],
    more: [
      ["Statistics", "Small shares give few samples. Wait until there are enough requests and use several metrics; one noisy metric should not decide alone."],
      ["Who is the canary", "Employees, then one region or cell, then a random share. Keep a user on the same version to avoid flip-flopping."],
      ["Baseline trick", "Start a fresh v1 instance beside the canary and compare those two: both are cold and equally sized."],
    ],
    use: "High-traffic services with good metrics.",
    avoid: "Low traffic, or changes that affect shared state for all users.",
    answer: "A canary exposes a small, fixed share of users, observes, and goes on only if metrics stay good. A rolling deployment steadily replaces instances, so without analysis a bad version reaches everyone within minutes.",
    qa: [
      ["What can a canary not detect?", "Problems that appear only at full load, after hours (leaks), for rare users, or in shared resources such as a database that both versions use."],
      ["How do you canary a message consumer?", "Give the canary a share of partitions or a separate consumer group on a copy of the traffic, and compare results and errors per message."],
    ],
  }),
  "deployment-patterns--feature-flags": deep({
    anim: ["Turning off a feature in two seconds", "o:On-call | f:Flag service:new-pay 10% | a:App server | u1:User in 10%, u2:Other user", [
      ["a>f", "stream rules", "The app keeps the rules in memory and receives updates by a stream. Evaluating a flag takes microseconds.", "a=rules cached"],
      ["u1>a", "pay", "User 1's id hashes to bucket 7, below 10: the new path. Always the same for this user.", "u1=new path"],
      ["u2>a", "pay", "User 2 is in bucket 63: the old path. Both are in the same deployed version.", "u2=old path"],
      ["u1>a", "errors", "The new path starts failing.", "a=!errors new path"],
      ["o>f", "set 0%", "On-call switches the flag off. No build, no deploy, no restart.", "f=new-pay 0%"],
      ["f>a", "push rule", "All servers have the new rule in about two seconds.", "a=+old path; u1=+old path"],
    ]],
    more: [
      ["Kinds", "Release flags (days), experiments (weeks), operational switches (long), permission flags (permanent). Each needs an owner and an expiry date."],
      ["Flag debt", "Each flag doubles the paths. Remove it when finished; track age, and fail the build for expired ones."],
      ["Defaults", "If the flag service is down, use the last known or a safe default coded in the app. Test both values."],
    ],
    use: "Gradual release, kill switches, testing in production, trunk-based development.",
    avoid: "Permanent configuration or as a replacement for proper permissions.",
    answer: "A flag is only data that running servers already check, so the change takes effect in seconds. Even a fast rollback must start old instances, pass health checks and drain the new ones, which takes minutes and also reverts other changes.",
    qa: [
      ["How do you keep a user's experience stable during a percentage rollout?", "Hash the user id with the flag name into a bucket 0-99 and compare with the percentage. Raising the percentage only adds users."],
      ["Where should flags be evaluated?", "On the server for security and consistency, or at the edge for speed. Never send secrets or unreleased content to clients behind a client-side flag."],
    ],
  }),
  "deployment-patterns--a-b-testing-infrastructure": deep({
    anim: ["Sticky assignment and a valid comparison", "u:User 42 | h:Hash | a:Variant A:old button, b:Variant B:new button | e:Event log | s:Statistics", [
      ["u>h", "42 + exp name", "The user id and the experiment name are hashed to a number between 0 and 99.", "h=bucket 71"],
      ["h>b", "50-99 = B", "Bucket 71 belongs to B. **Every visit and every device** gives B again.", "b=user 42"],
      ["b>e", "exposure", "Log the exposure when the user really sees the button, not at login.", "e=42 saw B"],
      ["u>e", "purchase", "Later the purchase is logged and joined by the user id.", "e=42 saw B bought"],
      ["e>s", "compare", "A 3.0%, B 3.3% with 40,000 users each. Is it chance? The test says p = 0.015.", "a=3.0% buy; b=3.3% buy; s=+B wins"],
      ["h", "if not sticky", "If assignment changed on each visit, users would see both and the effects would mix: no valid conclusion.", "s=!invalid"],
    ]],
    more: [
      ["Plan first", "Choose the main metric, the smallest effect that matters and the sample size before starting. Peeking every day and stopping on success produces false wins."],
      ["Guardrails", "Watch latency, errors, refunds and unsubscribes. A win on clicks that loses on refunds is a loss."],
      ["Sample ratio check", "Expecting 50/50 and getting 52/48 with many users means broken assignment or logging. Discard the result."],
    ],
    use: "Decisions with measurable outcome and enough traffic.",
    avoid: "Few users, or changes that affect everyone at once (network effects).",
    answer: "If a user switches between variants, their behaviour is influenced by both and cannot be attributed to either. Sticky assignment keeps the groups separate and comparable, and prevents a confusing experience.",
    qa: [
      ["How do you run many experiments at once?", "Salt the hash per experiment so that assignments are independent, use layers for experiments that must not overlap, and check for interactions on important ones."],
      ["What if users influence each other?", "Randomise clusters (cities, teams) or time slots instead of single users, because the control group is affected by the treatment group."],
    ],
  }),
  "deployment-patterns--schema-migrations": deep({
    anim: ["Renaming a column without downtime", "v1:App v1, v2:App v2:not deployed | d:users table:name | b:Backfill", [
      ["d", "rename now?", "Renaming `name` to `full_name` directly breaks v1 the moment it happens.", "v1=!breaks"],
      ["d", "expand: add", "Step 1: add an empty, nullable column. v1 does not notice.", "d=name + full_name; v1=+works"],
      ["v2>d", "write both", "Step 2: deploy v2 which writes **both** and reads the old one.", "v2=+writes both"],
      ["b>d", "copy in batches", "Step 3: copy old rows, 1,000 at a time, with pauses.", "b=+100% copied"],
      ["v2>d", "read new", "Step 4: read from the new column. Rollback is still possible, since both are current.", "v2=+reads new"],
      ["d", "contract: drop", "Step 5: when nothing uses the old column any more, drop it in a **later** release.", "d=+full_name; v1=gone"],
    ]],
    more: [
      ["Locks", "Some ALTERs rewrite or lock the table. Use online methods (concurrent index, not-valid constraints then validate), and always set a lock timeout."],
      ["Migrations are code", "Versioned, reviewed, tested on production-size data, applied once by the pipeline. Never by hand."],
      ["Going back", "Down-migrations often lose data. Prefer rolling forward: compatible steps make rollback of the app safe without touching the schema."],
    ],
    use: "Any change to a table that a running system uses.",
    avoid: "Combining expand and contract in a single release.",
    answer: "During the roll, old and new code run at once on the same schema. If the schema changes with the new code, the old instances break; if the code goes first, the new ones break. So make the schema compatible with both first, then change code, then clean up.",
    qa: [
      ["How do you add a NOT NULL column to a huge table?", "Add it nullable (or with a constant default if that is metadata-only), write it from the app, backfill in batches, add a not-valid check, validate, then set NOT NULL."],
      ["How do you backfill safely?", "Small batches by primary key, commit each, pause based on replica lag, make it restartable, and verify counts at the end."],
    ],
  }),
  "deployment-patterns--rollbacks-immutable-infrastructure": deep({
    anim: ["Mutable server against immutable images", "o:Operator | m:Mutable server:v1 | r:Image registry:v1 v2 | f1:Fleet:v1, f2:New fleet:none", [
      ["o>m", "ssh + patch", "Mutable: someone logs in, upgrades a library and edits a config file.", "m=~v1 + changes"],
      ["o>m", "undo?", "To undo it you must remember every step. Servers slowly become different: drift.", "m=!unknown state"],
      ["r>f1", "deploy v2", "Immutable: servers are never changed. v2 is a new image and new instances.", "f1=v2"],
      ["f1", "v2 fails", "v2 shows errors in production.", "f1=!errors"],
      ["r>f2", "deploy v1", "Rollback is the **same operation** with another image id. v1 is bit for bit what ran yesterday.", "f2=+v1"],
      ["o>f1", "terminate", "The bad instances are destroyed. Nothing has to be cleaned.", "f1=removed"],
    ]],
    more: [
      ["What rollback cannot undo", "Data written in a new format, messages sent, migrations, external calls. Plan compatible data, or roll forward with a fix."],
      ["Config too", "Version configuration and secrets references along with the image; a rollback of code with new config is an untested combination."],
      ["Practise", "Roll back on purpose now and then. Measure the time; unpractised rollbacks fail when needed most."],
    ],
    use: "Containers, virtual machine images, serverless: nearly everything stateless.",
    avoid: "Treating databases as disposable. They need their own recovery plan.",
    answer: "Each version is a complete, unchanging artifact. Deploying forward or back is the same step: start instances from a given image and send traffic to them. Nothing has to be reversed on existing servers and the old version is exactly what was tested.",
    qa: [
      ["Roll back or roll forward?", "Roll back when the old version is compatible with current data: fastest and known. Roll forward when data or contracts already changed, or the fix is trivial and well tested."],
      ["What is configuration drift?", "Servers that should be equal differ after manual changes. It makes bugs irreproducible. Immutable images and infrastructure as code remove it."],
    ],
  }),
};
