"""Server-Sent Events (SSE) Stream Router

Broadcasts live pipeline events to connected DevSecOps dashboards in real-time.
"""

import asyncio
import json
import logging
from typing import AsyncGenerator
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

logger = logging.getLogger(__name__)

router = APIRouter()

connected_clients: list[asyncio.Queue] = []

async def notify_clients(event_data: dict):
    """Broadcast an event payload to all active client connections."""
    raw = f"data: {json.dumps(event_data)}\n\n"
    to_remove = []
    for queue in connected_clients:
        try:
            queue.put_nowait(raw)
        except asyncio.QueueFull:
            to_remove.append(queue)
    for q in to_remove:
        if q in connected_clients:
            connected_clients.remove(q)

async def _event_stream(queue: asyncio.Queue) -> AsyncGenerator[str, None]:
    # Initial connection packet
    yield f"data: {json.dumps({'type': 'connected', 'message': 'SSE Stream Established'})}\n\n"
    try:
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=25.0)
                yield msg
            except asyncio.TimeoutError:
                yield ": heartbeat\n\n"
    except asyncio.CancelledError:
        pass
    finally:
        if queue in connected_clients:
            connected_clients.remove(queue)

@router.get("/")
async def sse_feed():
    """Client subscription endpoint for real-time multi-agent pipeline notifications."""
    queue: asyncio.Queue = asyncio.Queue(maxsize=150)
    connected_clients.append(queue)
    return StreamingResponse(
        _event_stream(queue),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
