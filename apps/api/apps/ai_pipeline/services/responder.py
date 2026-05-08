from typing import AsyncIterator

from django.conf import settings
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

RESPONDER_SYSTEM_PROMPT = """You are a helpful assistant. Answer the user's question based on the provided context.
If no context is provided, answer from your general knowledge.
Be concise, accurate, and helpful.
"""


def _get_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=settings.RESPONDER_LLM_API_KEY,
        openai_api_base=settings.RESPONDER_LLM_BASE_URL,
        temperature=0.3,
        streaming=True,
    )


async def stream_response(question: str, context: str) -> AsyncIterator[str]:
    llm = _get_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", RESPONDER_SYSTEM_PROMPT),
            ("human", "Question: {question}\n\nContext:\n{context}"),
        ]
    )
    chain = prompt | llm
    async for chunk in chain.astream({"question": question, "context": context}):
        if chunk.content:
            yield chunk.content
