"""Cola de auditoría asíncrona no bloqueante."""

import queue
from typing import Optional, List
from .models import AuditEvent

class AuditQueue:
    """Buffer en memoria / canal asíncrono para eventos de conformidad sin contención."""
    def __init__(self, maxsize: int = 10000):
        self._q: queue.Queue = queue.Queue(maxsize=maxsize)

    def put(self, event: AuditEvent) -> bool:
        try:
            self._q.put_nowait(event)
            return True
        except queue.Full:
            return False

    def get(self, timeout: Optional[float] = None) -> Optional[AuditEvent]:
        try:
            return self._q.get(timeout=timeout)
        except queue.Empty:
            return None

    def drain(self) -> List[AuditEvent]:
        items = []
        while not self._q.empty():
            try:
                items.append(self._q.get_nowait())
            except queue.Empty:
                break
        return items

    @property
    def size(self) -> int:
        return self._q.qsize()
