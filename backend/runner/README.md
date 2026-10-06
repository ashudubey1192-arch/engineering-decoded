# Java practice execution

Run this private service on a dedicated runner host with Python 3.11+ and a Linux-container Docker daemon. The Spring API proxies authenticated requests; do not expose this service directly to browsers. No programs execute in the API process or on the host JVM.

1. Pull the JDK image: `docker pull eclipse-temurin:21-jdk`. For shared deployment, set `JAVA_RUNNER_IMAGE` to the reviewed image digest. The service never pulls images in response to a submission.
2. Set a random `JAVA_RUNNER_TOKEN` of at least 32 characters on both services.
3. Run `python backend/runner/java_runner.py` on the runner host. It binds to `127.0.0.1:8091` by default. If using a separate host, expose it only on a private network and set `JAVA_RUNNER_HOST` accordingly.
4. Set `JAVA_RUNNER_URL` on the API (for a same-host API, `http://127.0.0.1:8091`). A containerized API needs an address reachable from that container, such as a configured private runner host; its own localhost points to itself.
5. Restart the API. Sign in, open a DSA lesson, and select Java coding practice. The UI checks readiness and preserves drafts while offline.

Each test creates a disposable container with no network, read-only root filesystem, non-root user, no Linux capabilities, no-new-privileges, 256 MiB memory, one CPU, 64 processes, a bounded writable tmpfs, a 12-second host deadline, and a 16 KiB output cap. Only the temporary source and input directory is mounted read-only. Containers are force-removed after errors and timeouts. Do not mount the Docker socket or application secrets inside submission containers. Use a dedicated runner host for untrusted public workloads, and add infrastructure request-rate limits before exposing the API publicly.

At most two runs execute concurrently in each API/runner process. The Java runner requires authentication through the API and an independent service token. A cancellation in the browser abandons the request; any already-started container remains bounded by the service deadline.

Tests: `python -m unittest discover -s backend/runner -p "test_*.py"`. Run `npm run check:dsa-java` to compile and execute the authored reference solutions with the locally installed JDK; this does not execute user submissions on the host.
