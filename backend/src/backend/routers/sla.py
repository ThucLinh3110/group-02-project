from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db
from ..models import Ticket, TicketStatus

router = APIRouter(prefix="/api/dashboard", tags=["sla"])

class SLAMetrics(BaseModel):
    on_track: int
    at_risk: int
    breached: int
    total_active: int

@router.get("/sla-metrics", response_model=SLAMetrics)
async def get_sla_metrics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.status != TicketStatus.CLOSED, Ticket.status != TicketStatus.RESOLVED))
    active_tickets = result.scalars().all()
    
    now = datetime.now()
    # If ticket uses timezone-aware datetime, now should be timezone-aware
    import datetime as dt
    now = dt.datetime.now(dt.timezone.utc)
    
    on_track = 0
    at_risk = 0
    breached = 0
    
    for ticket in active_tickets:
        if not ticket.sla_due_at:
            continue
            
        remaining_time = ticket.sla_due_at - now
        total_duration = ticket.sla_due_at - ticket.created_at
        
        if total_duration.total_seconds() <= 0:
            breached += 1
            continue
            
        remaining_ratio = remaining_time.total_seconds() / total_duration.total_seconds()
        
        if remaining_time.total_seconds() <= 0:
            breached += 1
        elif remaining_ratio <= 0.25 or remaining_time.total_seconds() < 3600:
            at_risk += 1
        else:
            on_track += 1
            
    return SLAMetrics(
        on_track=on_track,
        at_risk=at_risk,
        breached=breached,
        total_active=len(active_tickets)
    )
