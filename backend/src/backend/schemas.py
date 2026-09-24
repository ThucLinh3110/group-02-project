from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from .models import TicketCategory, TicketPriority, TicketStatus, MessageRole

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    sender_id: str
    sender_name: str
    role: MessageRole

class MessageResponse(MessageBase):
    id: int
    ticket_id: int
    sender_id: str
    sender_name: str
    role: MessageRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None

class TicketResponse(TicketBase):
    id: int
    ticket_code: str
    attachment_urls: Optional[List[str]] = []
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    needs_manual_review: bool
    sla_breached: bool
    created_at: datetime
    sla_due_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TicketDetailResponse(TicketResponse):
    messages: List[MessageResponse] = []

class ArticleBase(BaseModel):
    title: str
    category: str
    content: str

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
