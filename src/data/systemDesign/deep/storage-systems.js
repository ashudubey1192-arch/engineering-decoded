import { deep } from "../schema.js";

export default {
  "storage-systems--block-vs-file-vs-object-storage": deep({
    anim: ["Saving one photo in three storage types", "a:App | b:Block volume, f:File share, o:Object store | m:Metadata", [
      ["a>b", "write block 81", "Block storage offers numbered 4 KB blocks. It knows nothing about files; a file system or database on top gives meaning.", "b=raw blocks"],
      ["b>a", "0.5 ms", "It is the fastest and allows changing 4 KB in place: ideal for databases. Usually attached to **one** server.", "b=+0.5 ms"],
      ["a>f", "/albums/a.jpg", "File storage offers folders, names, locks and permissions, shared by many servers.", "f=/albums/a.jpg"],
      ["f>m", "walk folders", "Each path lookup walks the directory tree, and renames need locks. Billions of files become hard.", "m=~tree + locks"],
      ["a>o", "PUT photos/a.jpg", "Object storage takes a key, bytes and metadata over HTTP. The slash is just part of the name.", "o=key + bytes"],
      ["o>m", "hash key", "Keys live in a flat, sharded index, so it grows to trillions of objects. Objects are replaced whole, never edited.", "m=+flat index"],
    ]],
    more: [
      ["Cost and speed", "Per GB: block is the most expensive, file in the middle, object the cheapest. First byte: block under 1 ms, file a few ms, object tens of ms but with huge parallel throughput."],
      ["Durability", "A block volume is replicated in one zone. Object stores spread data over several zones and advertise eleven nines of durability."],
      ["Common combination", "Database on block, shared uploads or home folders on file, images, backups and data lake on object storage."],
    ],
    use: "Block for databases, file for shared POSIX access, object for anything large, static or shared by HTTP.",
    avoid: "Running a database on object storage directly, or storing millions of tiny objects that are updated often.",
    answer: "A flat key space can be hashed and split across many metadata servers: no directory tree to walk, lock or keep consistent. Metadata travels with each object, and whole-object replacement avoids coordinating partial edits. A hierarchy needs all of these.",
    qa: [
      ["Where would you store user-uploaded images?", "Object storage, with the key in the database and a CDN in front. It is cheap, durable, shared by all servers and keeps the database small."],
      ["Can object storage act as a file system?", "Adapters exist, but rename, append and locking are emulated and slow. Use them for reading large files, not for applications that need POSIX semantics."],
    ],
  }),
  "storage-systems--object-storage": deep({
    anim: ["A PUT into an object store", "c:Client | f:Front end | m:Metadata index | d1:Disk zone 1, d2:Disk zone 2, d3:Disk zone 3", [
      ["c>f", "PUT cat.jpg", "The front end authenticates the request and calculates a checksum.", "f=8 MB"],
      ["f>d1,d2,d3", "fragments", "The bytes are split into erasure-coded fragments and written to disks in three zones.", "d1=frags; d2=frags; d3=frags"],
      ["d2", "zone slow", "One zone is slow. Enough fragments are already safe, so the write can finish.", "d2=~slow"],
      ["f>m", "commit key", "Only now is the key published in the index. Readers see the whole object or nothing.", "m=+cat.jpg v1"],
      ["c>f", "PUT again", "A new upload writes new fragments and switches the key to v2. The old bytes are untouched meanwhile.", "m=cat.jpg v2"],
      ["m", "cleanup", "Old fragments are removed later, or kept if versioning is enabled.", "m=+v1 kept or freed"],
    ]],
    more: [
      ["Consistency", "Major stores now give strong read-after-write per key. Listing large prefixes is still slow; keep your own index for queries."],
      ["Access control", "Block public access by default, use short-lived signed URLs for users, and separate buckets by sensitivity. Public buckets are a common cause of leaks."],
      ["Events", "A new object can trigger processing (thumbnail, virus scan). Handlers must be idempotent, because events may repeat."],
    ],
    use: "Media, backups, logs, data lakes, static sites, machine learning data.",
    avoid: "Frequent small edits, append-heavy files, or low-latency random access.",
    answer: "If an object never changes, every copy is identical forever: no locking, no merging of partial edits, safe caching, simple parallel reads. Replication just copies bytes, and replacing means writing a new object and switching the key atomically.",
    qa: [
      ["How do you handle many small files?", "Bundle them into larger archives with an index, or store them in a database. Per-request overhead and cost dominate when objects are a few KB."],
      ["How do you prevent accidental deletion?", "Versioning, object lock or retention, MFA or restricted delete rights, cross-account replication, and lifecycle rules that are tested before use."],
    ],
  }),
  "storage-systems--distributed-file-systems": deep({
    anim: ["Writing and reading a 256 MB file", "c:Client | n:Name server:metadata | d1:Data node 1, d2:Data node 2, d3:Data node 3, d4:Data node 4", [
      ["c>n", "create log.txt", "The client asks where to put the file. The name server plans two 128 MB chunks, three copies each.", "n=2 chunks planned"],
      ["c>d1", "chunk A", "The client sends chunk A to node 1 only.", "d1=A"],
      ["d1>d2", "pipeline", "Node 1 passes it to node 2, which passes it to node 3. The client's link is used once.", "d2=A; d3=A"],
      ["c>d4", "chunk B", "Chunk B starts elsewhere. Reading can later use several disks **in parallel**.", "d4=B; d2=A B; d3=A B"],
      ["d2", "node fails", "Node 2 stops sending heartbeats.", "d2=!down"],
      ["n>d3", "re-replicate", "The name server sees chunks with two copies and orders new copies elsewhere. Readers notice nothing.", "d1=+A B; n=3 copies again"],
    ]],
    more: [
      ["Control and data paths", "The name server handles only metadata; bytes flow directly between clients and data nodes. That keeps one small server from limiting a petabyte system."],
      ["Rack awareness", "Two copies in one rack and one in another survive a rack failure while keeping most traffic local."],
      ["Small files problem", "Every file and chunk uses name server memory. Millions of tiny files fill it up long before the disks are full."],
    ],
    use: "Large sequential files for batch processing near the data.",
    avoid: "Low-latency small reads, or many concurrent writers to one file.",
    answer: "Several copies on different machines survive failures, and lost copies can be rebuilt from many nodes at once. For speed, chunks are on different disks and can be read in parallel, and each chunk can be read from the nearest or least busy copy.",
    qa: [
      ["Is the name server a single point of failure?", "It was in early designs. Today a standby follows a shared edit log kept by a quorum, with automatic failover and fencing of the old one."],
      ["Why are chunks so large?", "Less metadata, fewer connections, and sequential reads where seek time is negligible. The cost is inefficiency for small files."],
    ],
  }),
  "storage-systems--erasure-coding": deep({
    anim: ["Rebuilding data from a 4+2 code", "o:Object 4 MB | d1:D1 D2, d2:D3 D4, p:P1 P2 | r:Reader", [
      ["o>d1,d2", "4 data parts", "The object is cut into four 1 MB parts.", "d1=2 MB; d2=2 MB"],
      ["o>p", "2 parity parts", "Two parity parts are calculated. Total 6 MB for 4 MB: **1.5x** instead of 3x with triple copies.", "p=2 MB"],
      ["r>d1", "normal read", "Normally the reader just joins the data parts. No decoding is needed.", "r=+4 MB"],
      ["d2", "2 disks fail", "Two disks fail at once: D3 and D4 are gone.", "d2=!lost"],
      ["d1>r", "D1 D2", "Any 4 of the 6 parts are enough. The reader takes D1 and D2...", "r=2 of 4 parts"],
      ["p>r", "P1 P2", "...and P1 and P2, and solves the equations to recompute D3 and D4.", "r=+4 MB rebuilt"],
      ["r>d2", "repair", "A repair job writes the missing parts to new disks. It had to read 4 parts per lost part: repair traffic is the price.", "d2=+restored"],
    ]],
    more: [
      ["Overhead versus tolerance", "(k + m) / k: 10+4 costs 1.4x and tolerates 4 losses. Triple replication costs 3x and tolerates 2."],
      ["Local repair codes", "Extra parity over small groups lets a single failure be repaired from 5 parts instead of 10, for a little more space."],
      ["Where it fits", "Large, cold, immutable data. Hot or small data stays replicated since partial updates need read-modify-write on parity."],
    ],
    use: "Object stores, backups and archives at large scale.",
    avoid: "Small random updates, or latency-critical reads during failures.",
    answer: "The 14 parts are linear combinations such that any 10 determine the original, so losing any 4 leaves enough. Storage is 14/10 = 1.4x, compared with 3x for three full copies, which survive only two losses.",
    qa: [
      ["Why not use erasure coding everywhere?", "Reads during failure and repairs are expensive in network and CPU, small writes are inefficient, and latency is higher. Replication is simpler and faster for hot data."],
      ["How do you place the parts?", "On different disks, machines, racks and preferably zones, so that one failure domain never holds more than m parts of the same object."],
    ],
  }),
};
