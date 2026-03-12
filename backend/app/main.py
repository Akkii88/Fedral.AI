from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routers import hospitals, admin, experiments, hospital_agent, public_test
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Fedral API", version="2.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(hospitals.router)
app.include_router(admin.router)
app.include_router(experiments.router)
app.include_router(hospital_agent.router)
app.include_router(public_test.router)  # New public API for hospital testing

@app.get("/")
def read_root():
    return {"status": "online", "system": "Fedral Healthcare Platform V2"}
