#!/usr/bin/env bash
set -e

python3 -m venv /home/vscode/.venv || true
source /home/vscode/.venv/bin/activate

pip install --upgrade pip setuptools wheel flask pytest requests

if [ -f package.json ]; then
  npm install || true
fi
if [ -d frontend ] && [ -f frontend/package.json ]; then
  cd frontend && npm install || true
fi

echo "Devcontainer setup complete. Activate venv with: source /home/vscode/.venv/bin/activate"
