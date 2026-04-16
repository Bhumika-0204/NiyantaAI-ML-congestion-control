# This file is an entrypoint for cloud providers (like Render) 
# that default to looking for `main.py` in the root folder.
# It simply imports and exposes the actual application.

import os
from app.main import app

if __name__ == "__main__":
    import uvicorn
    # Important: Cloud providers like Render assign a dynamic port via the PORT env var
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
