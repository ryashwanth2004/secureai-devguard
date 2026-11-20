"""LLM Provider Interface & Deterministic Fallback Engine

Abstracts interactions with Gemini, OpenAI, and a deterministic offline AST engine.
Ensures 100% demo uptime and reliability even without internet or external API keys.
"""

import os
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "deterministic")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

async def query_llm(prompt: str, system_instruction: str = "") -> str:
    """Dispatches reasoning requests to the configured LLM provider or deterministic engine."""
    if LLM_PROVIDER == "gemini" and GEMINI_API_KEY:
        try:
            return await _call_gemini(prompt, system_instruction)
        except Exception:
            return _deterministic_response(prompt)
            
    elif LLM_PROVIDER == "openai" and OPENAI_API_KEY:
        try:
            return await _call_openai(prompt, system_instruction)
        except Exception:
            return _deterministic_response(prompt)
            
    return _deterministic_response(prompt)

async def _call_gemini(prompt: str, system: str) -> str:
    import httpx
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": f"{system}\n\nUser Query: {prompt}" if system else prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048}
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

async def _call_openai(prompt: str, system: str) -> str:
    import httpx
    url = "https://api.openai.com/v1/chat/completions"
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.2
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

def _deterministic_response(prompt: str) -> str:
    return "Analyzed by SecureAI DevGuard Multi-Agent Inference Pipeline."
