import os
import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .ai_client import ai_triage_ticket
from .sla_engine import calculate_sla_due_date
from ..models import Ticket, TicketCategory, TicketPriority, Message, MessageRole
from ..database import AsyncSessionLocal

async def trigger_ai_triage(ticket_id: int):
    async with AsyncSessionLocal() as db:
        # Retrieve ticket
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalars().first()
        if not ticket:
            return

    # Call AI Triage with 3.0s timeout limit
        triage_result = await ai_triage_ticket(ticket.description)
        
        # Update ticket based on AI result
        try:
            ticket.category = TicketCategory(triage_result["category"])
        except ValueError:
            ticket.category = TicketCategory.UNKNOWN
        
        try:
            ticket.priority = TicketPriority(triage_result["priority"])
        except ValueError:
            ticket.priority = TicketPriority.UNASSIGNED
        
        ticket.needs_manual_review = triage_result["needs_manual_review"]
        
        # SLA due date based on created_at and assigned priority
        ticket.sla_due_at = calculate_sla_due_date(ticket.created_at, ticket.priority.value)
        
        # Q-HD-01: Fallback khi AI sập (Timeout/Error)
        if triage_result.get("error"):
            system_msg = Message(
                ticket_id=ticket.id,
                sender_id="system",
                sender_name="System",
                role=MessageRole.SYSTEM,
                content="AI đang bận hoặc gặp sự cố, chuyển sang phân công thủ công."
            )
            db.add(system_msg)
            
        await db.commit()
    
# AI Draft generation for UC-05
draft_model = genai.GenerativeModel(model_name="gemini-flash-lite-latest")

async def generate_ai_draft(ticket_description: str, kb_articles: list) -> str:
    # RAG simulation: If kb_articles are empty, return no_match indicator
    if not kb_articles:
        return "" # Will be handled by the router
        
    context = "\n".join([f"Title: {a.title}\nContent: {a.content}" for a in kb_articles])
    
    prompt = f"""
    You are an IT Support Agent. Draft a reply to the customer's ticket based ONLY on the provided Knowledge Base articles.
    Note: Customers might use specific terms (like "chuột", "bàn phím") which relate to general KB articles (like "Lỗi USB"). Please use logical deduction.
    If the KB articles do not contain the answer or are completely unrelated to the customer's issue, you MUST return EXACTLY the string: NO_MATCH
    
    If there is a match, you MUST format your response politely with an opening and a closing sentence, like this example:
    "Chào bạn, Dựa trên thông tin bạn cung cấp về việc [Tên sự cố], bạn vui lòng thực hiện các bước kiểm tra sau: [Các bước hướng dẫn từ KB]. Nếu vẫn không thành công, IT sẽ tiến hành kiểm tra thêm cho bạn."
    Do not output any other extra text.
    
    Knowledge Base Articles:
    {context}
    
    Customer Ticket Description:
    {ticket_description}
    
    Draft Response:
    """
    response = await draft_model.generate_content_async(prompt)
    return response.text.strip()
