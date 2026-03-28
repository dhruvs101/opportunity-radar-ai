#!/bin/bash
# Run the Opportunity Radar AI backend
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from template. Please add your ANTHROPIC_API_KEY"
fi

pip install -r requirements.txt -q

export PYTHONPATH="${PYTHONPATH}:$(pwd)"

uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
