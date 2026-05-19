import logging

from django.conf import settings
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


def is_available() -> bool:
    missing = [
        key for key in ("RAGFLOW_API_KEY", "RAGFLOW_BASE_URL", "RAGFLOW_CHAT_ID")
        if not getattr(settings, key, "")
    ]
    if missing:
        logger.warning("RAGFlow not configured (%s missing) — ragflow source will be skipped", missing)
        return False
    return True


def _get_client() -> AsyncOpenAI:
    base_url = f"{settings.RAGFLOW_BASE_URL.rstrip('/')}/api/v1/openai/{settings.RAGFLOW_CHAT_ID}"
    return AsyncOpenAI(
        api_key=settings.RAGFLOW_API_KEY,
        base_url=base_url,
    )


async def query_ragflow(question: str) -> str:
    client = _get_client()
    response = await client.chat.completions.create(
        model="model",
        messages=[{"role": "user", "content": question}],
        stream=False,
    )
    answer = response.choices[0].message.content or ""
    logger.debug("[ragflow] answer length=%d", len(answer))
    return answer
