import os
from typing import Optional, List, Dict, Any, AsyncGenerator
import google.generativeai as genai
from app.ai.providers.base import BaseLLMProvider
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class GeminiProvider(BaseLLMProvider):
    """Google Gemini LLM provider implementation"""

    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
        genai.configure(api_key=api_key)
        self.text_model = genai.GenerativeModel("gemini-2.0-flash")
        self.embedding_model = "models/text-embedding-004"
        logger.info("Gemini provider initialized")

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        **kwargs: Any
    ) -> str:
        try:
            config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                **kwargs
            )

            if system_prompt:
                model = genai.GenerativeModel(
                    "gemini-2.0-flash",
                    system_instruction=system_prompt
                )
            else:
                model = self.text_model

            response = await model.generate_content_async(
                prompt,
                generation_config=config
            )
            return response.text if response.text else ""
        except Exception as e:
            logger.error(f"Gemini text generation error: {str(e)}")
            raise

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
        **kwargs: Any
    ) -> Dict[str, Any]:
        try:
            config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                response_mime_type="application/json",
                **kwargs
            )

            if system_prompt:
                model = genai.GenerativeModel(
                    "gemini-2.0-flash",
                    system_instruction=system_prompt
                )
            else:
                model = self.text_model

            response = await model.generate_content_async(
                prompt,
                generation_config=config
            )
            import json
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini structured generation error: {str(e)}")
            raise

    async def generate_embedding(self, text: str) -> List[float]:
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="retrieval_document"
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Gemini embedding error: {str(e)}")
            raise

    async def stream_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        **kwargs: Any
    ) -> AsyncGenerator[str, None]:
        try:
            config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                **kwargs
            )

            if system_prompt:
                model = genai.GenerativeModel(
                    "gemini-2.0-flash",
                    system_instruction=system_prompt
                )
            else:
                model = self.text_model

            async for chunk in await model.generate_content_async(
                prompt,
                generation_config=config,
                stream=True
            ):
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Gemini streaming error: {str(e)}")
            raise


# Global instance
_llm_provider: Optional[GeminiProvider] = None


def get_llm_provider() -> GeminiProvider:
    """Get or create the LLM provider instance"""
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = GeminiProvider()
    return _llm_provider
