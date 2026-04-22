from pydantic import BaseModel, Field

from typing import List, Optional

class HistoryItem(BaseModel):
    role: str
    content: str

class ChatMessageRequest(BaseModel):
    """Request model for AI chat message."""
    message: str = Field(..., min_length=1, description="The raw user query string. Must be non-empty.")
    history: Optional[List[HistoryItem]] = Field(default_factory=list)
    context_block: Optional[str] = ""

class ChatMessageResponse(BaseModel):
    """Response model for AI chat reply."""
    reply: str = Field(..., description="The AI-generated response text.")
