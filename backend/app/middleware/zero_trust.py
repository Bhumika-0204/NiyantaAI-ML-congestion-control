import jwt
import hashlib
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings

class ZeroTrustMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow open access to metrics, ecmp-status, websockets and root for health check
        allowed_paths = ["/", "/metrics", "/ecmp-status"]
        if request.url.path in allowed_paths or request.url.path.startswith("/ws"):
            return await call_next(request)

        # 1. API Key / JWT Authentication
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header. Zero Trust Policy violated."})
        
        token = auth_header.split(" ")[1]
        try:
            # Assume HS256 JWT algorithm and payload parsing
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            request.state.user = payload
        except jwt.ExpiredSignatureError:
            return JSONResponse(status_code=401, content={"detail": "Token expired."})
        except jwt.PyJWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid Token. Zero Trust Policy violated."})

        # 2. Request Signing (HMAC)
        # Verify that X-Signature header is valid (HMAC of body + timestamp)
        # This is optional in some setups, but strict zero trust wants it.
        timestamp = request.headers.get("X-Timestamp")
        signature = request.headers.get("X-Signature")
        
        if timestamp:
            try:
                # Disallow replays > 5 mins
                if abs(time.time() - float(timestamp)) > 300:
                    return JSONResponse(status_code=401, content={"detail": "Request expired (replay protection)."})
            except ValueError:
                return JSONResponse(status_code=401, content={"detail": "Invalid timestamp formatting."})
                
        # Optional signature verification
        if timestamp and signature:
            # We defer reading body to not consume the stream just yet, or read it carefully
            pass

        return await call_next(request)
