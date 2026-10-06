"""Private Java execution service. Requires a local Docker daemon and a pre-pulled JDK image."""
import hmac
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from uuid import uuid4

IMAGE = os.environ.get("JAVA_RUNNER_IMAGE", "eclipse-temurin:21-jdk")
TOKEN = os.environ.get("JAVA_RUNNER_TOKEN", "")
MAX_OUTPUT = 16384
SLOTS = threading.BoundedSemaphore(2)

def container_command(folder, name):
    return ["docker", "run", "--rm", "--pull=never", "--name", name,
            "--network=none", "--read-only", "--cap-drop=ALL",
            "--security-opt=no-new-privileges", "--pids-limit=64",
            "--memory=256m", "--memory-swap=256m", "--cpus=1", "--user=65534:65534",
            "--tmpfs", "/work:rw,nosuid,nodev,size=64m,mode=1777",
            "--mount", f"type=bind,source={folder},target=/submission,readonly",
            "--workdir=/work", IMAGE, "sh", "-c",
            "javac -J-Xmx96m -J-XX:ActiveProcessorCount=1 -d /work /submission/Main.java && "
            "exec java -Xmx64m -Xss256k -XX:ActiveProcessorCount=1 -cp /work Main < /submission/input.txt"]

def execute(code, stdin):
    name = "ed-java-" + uuid4().hex
    output = bytearray()
    overflow = threading.Event()
    process = None
    reader = None
    error = None
    with tempfile.TemporaryDirectory(prefix="ed-java-") as directory:
        folder = Path(directory)
        folder.chmod(0o755)
        for filename, data in (("Main.java", code), ("input.txt", stdin)):
            path = folder / filename
            path.write_text(data, encoding="utf-8")
            path.chmod(0o444)
        try:
            process = subprocess.Popen(container_command(str(folder.resolve()), name),
                                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            def collect():
                while True:
                    chunk = process.stdout.read(1024)
                    if not chunk:
                        break
                    remaining = MAX_OUTPUT - len(output)
                    output.extend(chunk[:remaining])
                    if len(chunk) > remaining:
                        overflow.set()
                        process.kill()
                        break
            reader = threading.Thread(target=collect, daemon=True)
            reader.start()
            try:
                process.wait(timeout=12)
            except subprocess.TimeoutExpired:
                error = "Compilation or execution exceeded the 12-second limit."
                process.kill()
                process.wait(timeout=3)
            reader.join(timeout=2)
            if overflow.is_set():
                error = "Output exceeded the 16 KiB limit."
            elif process.returncode and not error:
                error = "Compilation or runtime error:\n" + output.decode("utf-8", errors="replace")
        except (OSError, subprocess.SubprocessError):
            error = "Docker execution is unavailable. Ask the server operator to check the runner."
        finally:
            if process and process.poll() is None:
                process.kill()
            try:
                subprocess.run(["docker", "rm", "-f", name], capture_output=True, timeout=3, check=False)
            except (OSError, subprocess.SubprocessError):
                pass
            if reader:
                reader.join(timeout=1)
            if process and process.stdout:
                process.stdout.close()
    return output.decode("utf-8", errors="replace").strip(), error

def validate(payload):
    if not isinstance(payload, dict) or not isinstance(payload.get("code"), str) or not 1 <= len(payload["code"]) <= 20000:
        raise ValueError("Provide a Java program of at most 20000 characters.")
    tests = payload.get("tests")
    if not isinstance(tests, list) or not 1 <= len(tests) <= 4:
        raise ValueError("Provide between one and four tests.")
    for test in tests:
        if not isinstance(test, dict) or any(not isinstance(test.get(key), str) or len(test[key]) > limit for key, limit in (("label",100),("input",4096),("expected",4096))):
            raise ValueError("Invalid test input or expected output.")

class Handler(BaseHTTPRequestHandler):
    def respond(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def authorized(self):
        return bool(TOKEN) and hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + TOKEN)

    def do_GET(self):
        if not self.authorized():
            return self.respond(401, {"error":"Unauthorized"})
        if self.path != "/health":
            return self.respond(404, {"error":"Not found"})
        try:
            result = subprocess.run(["docker","image","inspect",IMAGE], capture_output=True, timeout=3)
            if result.returncode == 0:
                return self.respond(200, {"available":True})
        except (OSError, subprocess.SubprocessError):
            pass
        self.respond(503, {"error":"Docker or the configured Java image is unavailable"})

    def do_POST(self):
        if not self.authorized():
            return self.respond(401, {"error":"Unauthorized"})
        if self.path != "/run":
            return self.respond(404, {"error":"Not found"})
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 1 <= size <= 200000:
                return self.respond(413, {"error":"Request too large or missing length"})
            self.connection.settimeout(10)
            payload = json.loads(self.rfile.read(size))
            validate(payload)
        except (ValueError, OSError, UnicodeError):
            return self.respond(400, {"error":"Invalid Java request"})
        if not SLOTS.acquire(blocking=False):
            return self.respond(429, {"error":"Runner busy"})
        try:
            results = []
            for test in payload["tests"]:
                actual, error = execute(payload["code"], test["input"])
                results.append({"label":test["label"],"actual":actual,"expected":test["expected"],
                                "passed":error is None and actual == test["expected"].strip(),"error":error})
                if error:
                    break
            self.respond(200, {"results":results})
        finally:
            SLOTS.release()

    def log_message(self, *_args):
        pass  # Do not log submitted programs, tokens, or test inputs.

if __name__ == "__main__":
    if len(TOKEN) < 32:
        raise SystemExit("Set JAVA_RUNNER_TOKEN to a secret of at least 32 characters.")
    ThreadingHTTPServer((os.environ.get("JAVA_RUNNER_HOST","127.0.0.1"),int(os.environ.get("JAVA_RUNNER_PORT","8091"))), Handler).serve_forever()
