# Multi-stage build combining FastAPI and Streamlit
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Set working directory
WORKDIR /app

# Enable bytecode compilation and set link mode
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=fastapi-backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=fastapi-backend/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Add FastAPI source code
ADD fastapi-backend/ .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:/app/streamlit-dash/.venv/bin:$PATH"

# Expose ports
EXPOSE 8000

# Reset the entrypoint, don't invoke `uv`
ENTRYPOINT []

# Start service
CMD ["uv", "run", "uvicorn", "app.main:app"]
