"""
Rate limiting and monitoring for API endpoints
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
import logging

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiting(app: FastAPI):
    """
    Configure rate limiting for the FastAPI app
    
    Args:
        app: FastAPI application instance
    """
    
    # Add rate limit exception handler
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return {
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": exc.retry_after
        }
    
    # Define rate limits for different endpoints
    # Chat endpoint: 20 requests per minute per user
    app.state.rate_limit_chat = "20/minute"
    
    # General API: 100 requests per minute per user
    app.state.rate_limit_general = "100/minute"
    
    # Auth endpoints: 5 requests per minute per IP (prevent brute force)
    app.state.rate_limit_auth = "5/minute"
    
    logger.info("Rate limiting configured")
    
    return limiter


def get_rate_limiter():
    """Get the global rate limiter instance"""
    return limiter
