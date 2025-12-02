"""
FastAPI Main Application Entry Point
Payroll Management System
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import engine, Base
from app.auth import verify_api_key

# Load environment variables
load_dotenv()

# Create database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass


# Initialize FastAPI app
app = FastAPI(
    title="Payroll Management System API",
    description="A comprehensive payroll management system with employee tracking, work hours, and automated pay calculations",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Payroll Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "active"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Import and include routers
from app.routers import employees, work_hours, pay_runs, taxes_deductions

# Apply API key authentication to all API routes
app.include_router(
    employees.router, 
    prefix="/api/v1/employees", 
    tags=["Employees"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    work_hours.router, 
    prefix="/api/v1/work-hours", 
    tags=["Work Hours"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    pay_runs.router, 
    prefix="/api/v1/pay-runs", 
    tags=["Pay Runs"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    taxes_deductions.router, 
    prefix="/api/v1/taxes-deductions", 
    tags=["Taxes & Deductions"],
    dependencies=[Depends(verify_api_key)]
)


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    uvicorn.run("app.main:app", host=host, port=port, reload=debug)
