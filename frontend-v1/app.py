from flask import Flask, render_template, jsonify, request
import subprocess
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_EXE = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/run")
def run_simulation():
    mode = request.args.get("mode", "adaptive")

    cmd = [PYTHON_EXE, "controller/adaptive_controller.py"]
    if mode == "static":
        cmd.append("--static")

    result = subprocess.run(
        cmd,
        cwd=BASE_DIR,
        capture_output=True,
        text=True
    )

    return jsonify({"output": result.stdout or result.stderr})

if __name__ == "__main__":
    app.run(debug=True)
