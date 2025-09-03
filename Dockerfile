# Multi-stage build combining FastAPI and Streamlit
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Set working directory
WORKDIR /app

# Enable bytecode compilation and set link mode
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

# Create directories for both applications
RUN mkdir -p /app/fastapi-backend /app/streamlit-dash

# Install FastAPI dependencies
WORKDIR /app/fastapi-backend
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=fastapi-backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=fastapi-backend/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Add FastAPI source code
ADD fastapi-backend/ .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Install Streamlit dependencies
WORKDIR /app/streamlit-dash
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=streamlit-dash/uv.lock,target=uv.lock \
    --mount=type=bind,source=streamlit-dash/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Add Streamlit source code
ADD streamlit-dash/ .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Set working directory back to root
WORKDIR /app

# Place executables in the environment at the front of the path
ENV PATH="/app/fastapi-backend/.venv/bin:/app/streamlit-dash/.venv/bin:$PATH"

# Expose ports
EXPOSE 8501

# Create a startup script to run both services
RUN echo '#!/bin/bash\n\
    set -e\n\
    echo "Starting FastAPI server..."\n\
    cd /app/fastapi-backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &\n\
    echo "Starting Streamlit server..."\n\
    cd /app/streamlit-dash && uv run streamlit run main.py --server.port 8501 --server.address 0.0.0.0 &\n\
    echo "Both services started"\n\
    wait' > /app/start.sh

RUN chmod +x /app/start.sh

# Reset the entrypoint, don't invoke `uv`
ENTRYPOINT []

# Start both services
CMD ["/app/start.sh"]
