import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.future import select
from sqlalchemy import desc

from ..database import get_db
from ..models import Ticket, Message, TicketStatus, MessageRole, TicketPriority, UserRole, User
from ..schemas import TicketResponse, TicketDetailResponse, MessageResponse, MessageCreate, TicketUpdate
from .auth import get_current_user, get_current_agent

router = APIRouter(prefix="/api/tickets", tags=["tickets"])

# Create an uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=TicketResponse)
async def create_ticket(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(...),
    files: List[UploadFile] = File([]),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Chỉ cho phép đính kèm tối đa 5 ảnh.")
        
    attachment_urls = []
    for file in files:
        if file.filename:
            if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
                raise HTTPException(status_code=400, detail="Chỉ chấp nhận file ảnh.")
            
            contents = await file.read()
            if len(contents) > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Kích thước mỗi ảnh phải <= 5MB.")
            
            file_ext = os.path.splitext(file.filename)[1]
            filename = f"{uuid.uuid4()}{file_ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            with open(filepath, "wb") as f:
                f.write(contents)
            attachment_urls.append(f"/uploads/{filename}")

    # Generate sequential ticket code (Basic approach)
    result = await db.execute(select(Ticket).order_by(desc(Ticket.id)).limit(1))
    last_ticket = result.scalars().first()
    next_id = last_ticket.id + 1 if last_ticket else 1001
    ticket_code = f"TKT-{next_id}"

    new_ticket = Ticket(
        ticket_code=ticket_code,
        title=title,
        description=description,
        attachment_urls=attachment_urls,
        status=TicketStatus.NEW
    )
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)

    from ..services.ai_service import trigger_ai_triage
    background_tasks.add_task(trigger_ai_triage, new_ticket.id)

    return new_ticket

@router.get("", response_model=List[TicketResponse])
async def list_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).order_by(desc(Ticket.created_at)))
    return result.scalars().all()

@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int, 
    ticket_data: TicketUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Không tìm thấy ticket")
    
    if ticket_data.category:
        ticket.category = ticket_data.category
    if ticket_data.priority:
        # BR-HD-03: Khách hàng không được sửa priority nếu AI đã gán
        if current_user.role == UserRole.EMPLOYEE and ticket.priority != TicketPriority.UNASSIGNED:
            raise HTTPException(status_code=403, detail="Bạn không có quyền thay đổi mức độ ưu tiên sau khi AI đã phân loại.")
        ticket.priority = ticket_data.priority
        from ..services.sla_engine import calculate_sla_due_date
        ticket.sla_due_at = calculate_sla_due_date(ticket.created_at, ticket.priority.value)
        
    await db.commit()
    await db.refresh(ticket)
    return ticket


from sqlalchemy.orm import selectinload

@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Không tìm thấy ticket")
    
    msg_result = await db.execute(select(Message).where(Message.ticket_id == ticket_id).order_by(Message.created_at))
    messages = msg_result.scalars().all()
    
    ticket_dict = {
        "id": ticket.id,
        "ticket_code": ticket.ticket_code,
        "title": ticket.title,
        "description": ticket.description,
        "attachment_urls": ticket.attachment_urls,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "needs_manual_review": ticket.needs_manual_review,
        "sla_breached": ticket.sla_breached,
        "created_at": ticket.created_at,
        "sla_due_at": ticket.sla_due_at,
        "messages": messages
    }
    return ticket_dict

@router.get("/{ticket_id}/messages", response_model=List[MessageResponse])
async def get_ticket_messages(ticket_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message).where(Message.ticket_id == ticket_id).order_by(Message.created_at))
    return result.scalars().all()

@router.post("/{ticket_id}/messages", response_model=MessageResponse)
async def add_message(ticket_id: int, message_data: MessageCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Không tìm thấy ticket")
    
    new_message = Message(
        ticket_id=ticket_id,
        sender_id=message_data.sender_id,
        sender_name=message_data.sender_name,
        role=message_data.role,
        content=message_data.content
    )
    db.add(new_message)
    
    # Update ticket status if agent replies
    if message_data.role == MessageRole.AGENT and ticket.status == TicketStatus.NEW:
        ticket.status = TicketStatus.IN_PROGRESS
        
    await db.commit()
    await db.refresh(new_message)
    return new_message

@router.post("/{ticket_id}/resolve", response_model=TicketResponse)
async def resolve_ticket(ticket_id: int, db: AsyncSession = Depends(get_db), current_agent: User = Depends(get_current_agent)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Không tìm thấy ticket")
    
    ticket.status = TicketStatus.RESOLVED
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.post("/{ticket_id}/close", response_model=TicketResponse)
async def close_ticket(ticket_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Không tìm thấy ticket")
    
    ticket.status = TicketStatus.CLOSED
    await db.commit()
    await db.refresh(ticket)
    return ticket
