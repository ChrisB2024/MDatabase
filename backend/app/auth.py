"""
API Key Authentication
Simple authentication using API key in header
"""

import os
from fastapi import Header, HTTPException, status
from typing import Optional


def get_api_key() -> str:
    """Get API key from environment variables"""
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError("API_KEY environment variable is not set")
    return api_key


async def verify_api_key(x_api_key: Optional[str] = Header(None, description="API Key for authentication")):
    """
    Verify API key from request header
    
    Args:
        x_api_key: API key from X-API-Key header
        
    Raises:
        HTTPException: If API key is missing or invalid
        
    Returns:
        str: The validated API key
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is missing. Please provide X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    expected_api_key = get_api_key()
    
    if x_api_key != expected_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key. Access denied.",
        )
    
    return x_api_key
