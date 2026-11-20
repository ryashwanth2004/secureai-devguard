import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from .models import Base

load_dotenv()

is_vercel = os.getenv("VERCEL") == "1" or "VERCEL" in os.environ
db_path = "/tmp/secureai.db" if is_vercel else "./secureai.db"
default_db_url = f"sqlite+aiosqlite:///{db_path}"

DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
