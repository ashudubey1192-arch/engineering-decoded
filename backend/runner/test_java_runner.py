import unittest
import io
import subprocess
from unittest.mock import patch
import java_runner as runner

class RunnerTests(unittest.TestCase):
    @patch("java_runner.subprocess.run")
    def test_output_limit_and_timeout(self, cleanup):
        class FakeProcess:
            def __init__(self, data, timeout=False):
                self.stdout = io.BytesIO(data)
                self.returncode = 0
                self.timeout = timeout
            def wait(self, timeout):
                if self.timeout:
                    self.timeout = False
                    raise subprocess.TimeoutExpired("docker", timeout)
                return self.returncode
            def kill(self):
                self.returncode = -9
            def poll(self):
                return self.returncode
        with patch("java_runner.subprocess.Popen", return_value=FakeProcess(b"x" * (runner.MAX_OUTPUT + 100))):
            output, error = runner.execute("class Main {}", "")
            self.assertEqual(len(output), runner.MAX_OUTPUT)
            self.assertIn("Output exceeded", error)
        with patch("java_runner.subprocess.Popen", return_value=FakeProcess(b"", timeout=True)):
            _, error = runner.execute("class Main {}", "")
            self.assertIn("12-second", error)
        self.assertEqual(cleanup.call_count, 2)

    def test_isolation_flags(self):
        command = runner.container_command("/tmp/submission", "test-container")
        for flag in ["--network=none","--read-only","--cap-drop=ALL","--security-opt=no-new-privileges","--memory=256m","--pids-limit=64","--user=65534:65534","--pull=never"]:
            self.assertIn(flag, command)
        self.assertIn("type=bind,source=/tmp/submission,target=/submission,readonly", command)
        self.assertNotIn("--privileged", command)

    def test_validation(self):
        runner.validate({"code":"class Main {}", "tests":[{"label":"a","input":"","expected":""}]})
        for payload in [{}, {"code":"x","tests":[]}, {"code":"x"*20001,"tests":[{}]}, {"code":"x","tests":[{"label":"x","input":1,"expected":""}]}]:
            with self.assertRaises(ValueError):
                runner.validate(payload)

    @patch("java_runner.subprocess.run")
    @patch("java_runner.subprocess.Popen", side_effect=FileNotFoundError)
    def test_missing_docker_and_cleanup(self, _popen, run):
        actual, error = runner.execute("class Main {}", "")
        self.assertEqual(actual, "")
        self.assertIn("unavailable", error)
        self.assertEqual(run.call_args.args[0][:3], ["docker","rm","-f"])

if __name__ == "__main__":
    unittest.main()
