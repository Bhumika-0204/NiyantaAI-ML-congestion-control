import os
from openai import OpenAI
from app.core.logger import logger

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            logger.info("LLMService initialized with standard OpenAI client.")
        else:
            self.client = None
            logger.warning("LLMService missing OPENAI_API_KEY. Running in mock fallback mode.")
            
    def generate_explanation(self, prompt: str) -> str:
        """
        Calls the LLM to generate an explanation securely and concisely.
        Does NOT execute core routing logic.
        """
        if not self.client:
            return "Mock LLM System Response: Based on the provided context, the routing metrics reached critical levels. The recorded action was necessary to ensure stability and prevent cascading queue exhaustion."
            
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are Niyanta AI, an expert backend engineering reasoning engine. Provide concise, 2-to-3 sentence diagnostic explanations for routing policy actions based on the provided metrics and context."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return f"Error communicating with reasoning engine: {str(e)}"

llm_service = LLMService()
