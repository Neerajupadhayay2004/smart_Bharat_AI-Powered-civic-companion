# Smart Bharat Backend

AI-Powered Civic Companion Backend API

## Tech Stack

- **FastAPI**: Modern web framework
- **PostgreSQL**: Database with pgvector extension for embeddings
- **SQLAlchemy 2.0**: Async ORM
- **Google Gemini AI**: LLM provider
- **Redis**: Caching and rate limiting
- **Docker**: Containerization

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL 15+ with pgvector extension
- Redis 7+
- Docker (optional, for local dev)

### Local Development Setup

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # OR
   .\venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values!
   ```

5. **Start PostgreSQL and Redis (using Docker Compose)**:
   ```bash
   docker-compose up -d
   ```

6. **Initialize the database**:
   ```bash
   python -m scripts.init_db
   ```

7. **Run the server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### API Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for a complete list. The most important ones:

```env
# Database
DATABASE_URL=postgresql+asyncpg://smartbharat:smartbharat123@localhost:5432/smartbharat

# Redis
REDIS_URL=redis://localhost:6379/0

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Security
SECRET_KEY=your_secure_secret_key_change_this
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/             # API v1 endpoints
│   │   ├── deps.py         # Dependencies (db, auth, etc.)
│   │   └── router.py       # Main API router
│   ├── core/               # Core utilities
│   │   ├── config.py       # Settings
│   │   ├── database.py     # DB setup
│   │   ├── security.py     # Auth & security
│   │   └── ...
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic models
│   ├── ai/                 # AI/LLM components
│   │   ├── providers/      # LLM providers
│   │   ├── agents/         # AI agents
│   │   └── rag/            # RAG system
│   ├── seed/               # Seed data
│   └── main.py             # FastAPI app
├── alembic/                # DB migrations
├── scripts/                # Utility scripts
└── docker-compose.yml      # Local services
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `python -m uvicorn app.main:app --reload` | Run dev server |
| `python -m scripts.init_db` | Initialize DB |
