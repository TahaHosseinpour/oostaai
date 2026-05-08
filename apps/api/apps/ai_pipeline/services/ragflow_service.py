import asyncio
import logging

from django.conf import settings
from ragflow_sdk import RAGFlow

logger = logging.getLogger(__name__)


def is_available() -> bool:
    """Return True only if all required RAGFlow settings are present."""
    missing = [
        key for key in ("RAGFLOW_API_KEY", "RAGFLOW_BASE_URL", "RAGFLOW_CHAT_ID")
        if not getattr(settings, key, "")
    ]
    if missing:
        logger.warning("RAGFlow not configured (%s missing) — ragflow source will be skipped", missing)
        return False
    return True


def _get_client() -> RAGFlow:
    return RAGFlow(
        api_key=settings.RAGFLOW_API_KEY,
        base_url=settings.RAGFLOW_BASE_URL,
    )


def _ask_sync(question: str) -> str:
    client = _get_client()
    chats = client.list_chats(id=settings.RAGFLOW_CHAT_ID)
    if not chats:
        return ""
    assistant = chats[0]
    session = assistant.create_session()
    # ask() returns a generator; consume fully to get final answer
    chunks = list(session.ask(question, stream=False))
    return str(chunks[-1]) if chunks else ""


async def query_ragflow(question: str) -> str:
    # RAGFlow SDK is synchronous; run it in a thread to avoid blocking the event loop.
    return await asyncio.to_thread(_ask_sync, question)
