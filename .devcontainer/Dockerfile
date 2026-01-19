FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

ARG NODE_VERSION=18
ARG PYTHON_VERSION=3.11

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl ca-certificates git build-essential python3-pip python3-venv \
      pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    npm -g install npm@latest

RUN npm install -g @oracle/ojet-cli || true

USER vscode
WORKDIR /workspace

RUN python3 -m venv /home/vscode/.venv && \
    /home/vscode/.venv/bin/pip install --upgrade pip setuptools wheel

USER root
COPY post-create.sh /tmp/post-create.sh
RUN chown vscode:vscode /tmp/post-create.sh && chmod +x /tmp/post-create.sh

USER vscode
