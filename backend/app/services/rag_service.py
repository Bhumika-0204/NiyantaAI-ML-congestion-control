import os
from app.core.logger import logger

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

class RAGService:
    """
    Production-ready Vector Knowledge Base using ChromaDB integration.
    """
    def __init__(self):
        self.db_path = os.getenv("CHROMA_DB_PATH", "./data/vector_store")
        if not CHROMADB_AVAILABLE:
            self.client = None
            self.collection = None
            self.is_initialized = False
            logger.warning("RAGService: chromadb package not installed. Running in mock mode.")
            return
            
        try:
            self.client = chromadb.PersistentClient(path=self.db_path)
            self.collection = self.client.get_or_create_collection(name="network_docs")
            self.is_initialized = True
            logger.info(f"RAGService: Connected to ChromaDB persistent store at {self.db_path}.")
        except Exception as e:
            logger.warning(f"RAGService Initialization Error: {e}. Falling back to mock RAG engine.")
            self.client = None
            self.collection = None
            self.is_initialized = False
        
    def retrieve_context(self, query: str, top_k: int = 2) -> str:
        """
        Executes a dense similarity search across the vectorized documentation.
        """
        if not self.is_initialized or not self.collection:
            dummy_docs = [
                "Layer 7 application rate limiters systematically prevent backend thread starvation.",
                "High request latency simultaneously coupled with active queue saturation heavily indicates an algorithmic stall or DB lock, necessitating an immediate localized throttle policy to allow recovery."
            ]
            return " | ".join(dummy_docs)
            
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k
            )
            
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                return " | ".join(docs)
            
            return "No specific vector context found for this scenario."
        except Exception as e:
            logger.error(f"RAG search query error: {e}")
            return "Failure retrieving context from the designated Knowledge Base."

rag_service = RAGService()
