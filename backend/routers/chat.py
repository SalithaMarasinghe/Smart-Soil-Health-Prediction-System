from fastapi import APIRouter, HTTPException
from models.chat import ChatMessageRequest, ChatMessageResponse
from services import chat_service

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/message", response_model=ChatMessageResponse)
async def chat_message(request: ChatMessageRequest):
    """
    Endpoint to receive a user message and return an AI-generated reply.
    """
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty or whitespace only.")
        
    reply = await chat_service.get_ai_reply(request.message)
    return ChatMessageResponse(reply=reply)
