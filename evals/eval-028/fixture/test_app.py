import os, subprocess
r = subprocess.run(["python3", "-c", "from app import timeout; print(timeout())"],
                   capture_output=True, text=True, env={**os.environ, "TIMEOUT": "7000"})
assert r.returncode == 0 and r.stdout.strip() == "7000", r.stderr
print("ok")
