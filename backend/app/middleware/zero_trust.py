import jwt
import hashlib
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings

class ZeroTrustMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
            
        allowed_paths = ["/", "/metrics", "/ecmp-status", "/docs", "/openapi.json"]
        allowed_prefixes = ("/ws", "/api/v1/policies", "/api/v1/explain", "/api/v2/explain", "/api/v1/analyze")
        
        if request.url.path in allowed_paths or request.url.path.startswith(allowed_prefixes):
            return await call_next(request)

        
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header. Zero Trust Policy violated."})
        
        token = auth_header.split(" ")[1]
        try:
            
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            request.state.user = payload
        except jwt.ExpiredSignatureError:
            return JSONResponse(status_code=401, content={"detail": "Token expired."})
        except jwt.PyJWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid Token. Zero Trust Policy violated."})

        
        
        
        timestamp = request.headers.get("X-Timestamp")
        signature = request.headers.get("X-Signature")
        
        if timestamp:
            try:
                
                if abs(time.time() - float(timestamp)) > 300:
                    return JSONResponse(status_code=401, content={"detail": "Request expired (replay protection)."})
            except ValueError:
                return JSONResponse(status_code=401, content={"detail": "Invalid timestamp formatting."})
                
        
        if timestamp and signature:
            
            pass

        return await call_next(request)
