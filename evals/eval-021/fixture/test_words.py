import subprocess
r = subprocess.run(["python3", "src/words.py"], capture_output=True, text=True)
assert r.returncode == 0, r.stderr
assert r.stdout.strip() == "ok"
print("ok")
