import json
import logging
import traceback

from django.http import StreamingHttpResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .services.pipeline import run_pipeline

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class ChatView(View):
    async def post(self, request):
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError as e:
            logger.error("Invalid JSON body: %s", e)
            return StreamingHttpResponse(
                status=400, content_type="application/json"
            )

        prompt = body.get("prompt", "")
        messages = body.get("messages", [])
        thread_id = body.get("threadId", "")
        thread_item_id = body.get("threadItemId", "")
        parent_thread_item_id = body.get("parentThreadItemId", "")

        logger.info(
            "Chat request received | thread=%s item=%s prompt=%r",
            thread_id,
            thread_item_id,
            prompt[:120],
        )

        async def event_stream():
            try:
                async for event_type, payload in run_pipeline(
                    prompt=prompt,
                    messages=messages,
                    thread_id=thread_id,
                    thread_item_id=thread_item_id,
                    parent_thread_item_id=parent_thread_item_id,
                ):
                    yield f"event: {event_type}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
            except Exception as exc:
                logger.error(
                    "Unhandled exception in event_stream | thread=%s: %s\n%s",
                    thread_id,
                    exc,
                    traceback.format_exc(),
                )
                error_payload = json.dumps(
                    {
                        "threadId": thread_id,
                        "threadItemId": thread_item_id,
                        "parentThreadItemId": parent_thread_item_id,
                        "status": "error",
                        "error": str(exc),
                    },
                    ensure_ascii=False,
                )
                yield f"event: done\ndata: {error_payload}\n\n"

        response = StreamingHttpResponse(
            event_stream(),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
