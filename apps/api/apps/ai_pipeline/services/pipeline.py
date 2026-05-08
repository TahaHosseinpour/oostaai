import asyncio
import logging
import traceback
from typing import AsyncIterator

from . import db_service, ragflow_service
from .classifier import get_classifier_chain
from .responder import stream_response

logger = logging.getLogger(__name__)

VALID_DECISIONS = ("db", "ragflow", "both", "none")


async def run_pipeline(
    prompt: str,
    messages: list,
    thread_id: str,
    thread_item_id: str,
    parent_thread_item_id: str = "",
) -> AsyncIterator[tuple[str, dict]]:
    base = {
        "threadId": thread_id,
        "threadItemId": thread_item_id,
        "parentThreadItemId": parent_thread_item_id,
    }

    # ── Step 1: classify ─────────────────────────────────────────────────────
    yield ("steps", {**base, "steps": ["در حال تحلیل سوال..."]})
    try:
        logger.debug("[pipeline] Step 1: classifying prompt=%r", prompt[:80])
        classifier = get_classifier_chain()
        raw_decision = await classifier.ainvoke({"question": prompt})
        decision = raw_decision.strip().lower()
        if decision not in VALID_DECISIONS:
            logger.warning("[pipeline] Unexpected classifier output %r → fallback none", raw_decision)
            decision = "none"
        logger.info("[pipeline] Classifier decision: %s", decision)
    except Exception as exc:
        logger.error("[pipeline] Step 1 FAILED (classifier): %s\n%s", exc, traceback.format_exc())
        raise

    # ── Step 2: filter to only available services ─────────────────────────────
    wants_db = decision in ("db", "both")
    wants_ragflow = decision in ("ragflow", "both")

    use_db = wants_db and db_service.is_available()
    use_ragflow = wants_ragflow and ragflow_service.is_available()

    skipped = []
    if wants_db and not use_db:
        skipped.append("دیتابیس (غیرفعال)")
    if wants_ragflow and not use_ragflow:
        skipped.append("RAGFlow (غیرفعال)")
    if skipped:
        logger.info("[pipeline] Skipping unavailable services: %s", skipped)
        yield ("steps", {**base, "steps": [f"⚠️ سرویس در دسترس نیست: {', '.join(skipped)}"]})

    # ── Step 3: retrieve data in parallel ────────────────────────────────────
    context_parts: list[str] = []
    tasks: dict[str, asyncio.Future] = {}

    if use_db:
        tasks["db"] = asyncio.ensure_future(db_service.query_database(prompt))
    if use_ragflow:
        tasks["ragflow"] = asyncio.ensure_future(ragflow_service.query_ragflow(prompt))

    if tasks:
        step_labels = {"db": "جستجو در دیتابیس...", "ragflow": "جستجو در RAGFlow..."}
        yield ("steps", {**base, "steps": [step_labels[k] for k in tasks]})
        logger.debug("[pipeline] Step 3: running retrieval tasks: %s", list(tasks.keys()))

        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        for key, result in zip(tasks.keys(), results):
            if isinstance(result, Exception):
                logger.error(
                    "[pipeline] Step 3 retrieval '%s' FAILED: %s\n%s",
                    key,
                    result,
                    traceback.format_exc(),
                )
                yield ("steps", {**base, "steps": [f"⚠️ خطا در {key}: {type(result).__name__}"]})
            elif isinstance(result, str) and result:
                logger.debug("[pipeline] '%s' returned %d chars", key, len(result))
                context_parts.append(f"[{key.upper()} Data]\n{result}")

    context = "\n\n".join(context_parts)
    logger.debug("[pipeline] Total context length: %d chars", len(context))

    # ── Step 4: stream the final answer ──────────────────────────────────────
    yield ("steps", {**base, "steps": ["در حال تولید پاسخ..."]})
    try:
        logger.debug("[pipeline] Step 4: starting responder stream")
        chunk_count = 0
        async for chunk in stream_response(prompt, context):
            chunk_count += 1
            yield ("answer", {**base, "text": chunk})
        logger.info("[pipeline] Step 4: responder finished, chunks=%d", chunk_count)
    except Exception as exc:
        logger.error("[pipeline] Step 4 FAILED (responder): %s\n%s", exc, traceback.format_exc())
        raise

    yield ("done", {**base, "status": "complete"})
    logger.info("[pipeline] Pipeline complete | thread=%s", thread_id)
