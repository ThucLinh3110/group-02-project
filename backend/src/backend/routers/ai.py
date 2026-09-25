from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSessiozn

from sqlalchemy.future import select
from pydantic import BaseModel

from ..database import get_db
from ..models import Ticket, Article
from ..services.ai_service import generate_ai_draft

router = APIRouter(prefix="/api/tickets", tags=["ai"])

class AIDraftResponse(BaseModel):
    status: str
    draft: str

@router.post("/{ticket_id}/ai-suggest", response_model=AIDraftResponse)
async def suggest_ai_draft(ticket_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Basic semantic/keyword matching simulation (Fetching ALL for now, in real RAG we'd use pgvector)
    # Grab all articles to simulate context retrieval (Since we only have 20, passing all to LLM is fine)
    kb_result = await db.execute(select(Article))
    articles = kb_result.scalars().all()
    
    if not articles:
        return AIDraftResponse(
            status="no_match",
            draft="Không tìm thấy tài liệu liên quan, vui lòng phản hồi thủ công"
        )
        
    try:
        draft_text = await generate_ai_draft(ticket.description, articles)
        
        if draft_text == "NO_MATCH":
            return AIDraftResponse(
                status="no_match",
                draft="Không tìm thấy tài liệu liên quan, vui lòng phản hồi thủ công"
            )
        
        return AIDraftResponse(
            status="success",
            draft=draft_text
        )
    except Exception as e:
        # Fallback gracefully if AI crashes
        return AIDraftResponse(
            status="error",
            draft="Xin lỗi, hệ thống AI đang quá tải hoặc gặp sự cố kỹ thuật. Vui lòng thử lại sau."
        )
