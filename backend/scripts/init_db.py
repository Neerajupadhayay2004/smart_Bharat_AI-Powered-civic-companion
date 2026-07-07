"""
Initialize the database: create tables and seed data
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
from sqlalchemy.ext.asyncio import AsyncEngine
from app.core.database import async_engine, Base
from app.core.logging import get_logger
from app.seed.schemes import seed_schemes

logger = get_logger(__name__)


async def init_db():
    """Initialize database: create tables and seed data"""
    logger.info("Creating database tables...")

    # Create all tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Tables created successfully!")

    # Seed initial data
    logger.info("Seeding initial data...")
    await seed_schemes()
    logger.info("Initial data seeded successfully!")

    logger.info("Database initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_db())
