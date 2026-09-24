from datetime import datetime, timedelta
from typing import Optional
from ..models import TicketPriority

def calculate_sla_due_date(created_at: datetime, priority: str) -> Optional[datetime]:
    if priority == TicketPriority.URGENT:
        return created_at + timedelta(hours=4)
    elif priority == TicketPriority.HIGH:
        return created_at + timedelta(hours=24)
    elif priority == TicketPriority.MEDIUM:
        return created_at + timedelta(days=3)
    elif priority == TicketPriority.LOW:
        return created_at + timedelta(days=7)
    else:
        return created_at + timedelta(hours=24) # Fallback
