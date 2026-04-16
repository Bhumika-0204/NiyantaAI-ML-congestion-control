# This file is an entrypoint for cloud providers (like Render) 
# that default to looking for `main.py` in the root folder.
# It simply imports and exposes the actual application.

from app.main import app

if __name__ == "__main__":
    import uvicorn
    # Make sure we bind to 0.0.0.0 so Render/Docker can expose it externally
    uvicorn.run(app, host="0.0.0.0", port=8000)
