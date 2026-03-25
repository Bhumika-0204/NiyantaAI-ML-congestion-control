from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

class ReasoningAgent:
    def explain_decision(self, metrics: dict, action: str, anomaly: bool) -> str:
        # 1. Generate an internal search query based on the routing state
        if anomaly:
            query = "How to handle sudden network spikes and anomaly detection"
        else:
            query = "Best practices for handling network congestion and rate limiting application throughput"
            
        # 2. Retrieve Document Context
        context = rag_service.retrieve_context(query)
        
        # 3. Build the prompt for the LLM
        prompt = (
            f"The routing policy agent just took the action: '{action}'.\n"
            f"Current Real-Time Metrics: {metrics}\n"
            f"Anomaly Detected: {anomaly}\n\n"
            f"System Knowledge Context: {context}\n\n"
            f"Please write a human-readable, professional 2-sentence explanation of why this action was taken, and what it implies for the network."
        )
        
        # 4. Generate Insight
        explanation = llm_service.generate_explanation(prompt)
        return explanation

reasoning_agent = ReasoningAgent()
