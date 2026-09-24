from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from ..database import get_db
from ..models import Article
from ..schemas import ArticleResponse, ArticleCreate, ArticleUpdate

router = APIRouter(prefix="/api/kb", tags=["kb"])

@router.get("/search", response_model=List[ArticleResponse])
async def search_kb(q: str = Query(None), db: AsyncSession = Depends(get_db)):
    if not q or q == 'all':
        result = await db.execute(select(Article).order_by(Article.id.desc()))
    else:
        search_term = f"%{q}%"
        result = await db.execute(
            select(Article).where(
                or_(
                    Article.title.ilike(search_term),
                    Article.content.ilike(search_term)
                )
            ).order_by(Article.id.desc())
        )
    return result.scalars().all()

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại")
    return article

@router.post("", response_model=ArticleResponse)
async def create_article(article_data: ArticleCreate, db: AsyncSession = Depends(get_db)):
    # In a real app, RBAC checks (Admin/Manager role) would be handled by dependencies
    new_article = Article(
        title=article_data.title,
        category=article_data.category,
        content=article_data.content
    )
    db.add(new_article)
    await db.commit()
    await db.refresh(new_article)
    return new_article

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(article_id: int, article_data: ArticleUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại")
        
    article.title = article_data.title
    article.category = article_data.category
    article.content = article_data.content
    
    await db.commit()
    await db.refresh(article)
    return article

@router.delete("/{article_id}")
async def delete_article(article_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại")
        
    await db.delete(article)
    await db.commit()
    return {"detail": "Đã xóa bài viết"}
