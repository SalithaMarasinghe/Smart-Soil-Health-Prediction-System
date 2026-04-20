from pydantic import BaseModel, Field

class ChatMessageRequest(BaseModel):
    """Request model for AI chat message."""
    message: str = Field(..., min_length=1, description="The raw user query string. Must be non-empty.")

class ChatMessageResponse(BaseModel):
    """Response model for AI chat reply."""
    reply: str = Field(..., description="The AI-generated response text.")
