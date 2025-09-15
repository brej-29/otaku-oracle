import json
from django.conf import settings
from openai import OpenAI
from openai import APIError, RateLimitError, APIConnectionError, BadRequestError

class BothRateLimited(Exception):
    """Raised when primary AND fallback are rate-limited / overloaded."""
    pass

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

DEFAULT_MODEL = settings.DEFAULT_MODEL
FALLBACK_MODEL = settings.FALLBACK_MODEL

def _messages(prompt: str, image_url: str | None, image_data_url: str | None):
    content = [{"type": "text", "text": prompt}]
    if image_url:
        content.append({"type": "image_url", "image_url": {"url": image_url}})
    elif image_data_url:
        # Fallback for local drag-drop (data URL). Some models accept this.
        content.append({"type": "image_url", "image_url": {"url": image_data_url}})
    return [
    {
        "role": "system",
        "content": "You are a professional and passionate expert on all things anime and manga. You are well-versed in genre tropes, character archetypes, animation studios, and famous mangaka. You can discuss plot points, character development, and art styles with an enthusiastic and knowledgeable tone. Your goal is to provide insightful and detailed information while sharing your love for the medium."
    }, 
    {
        "role": "user", 
        "content": content
    }]


def _call_model(model: str, prompt: str, image_url: str | None, image_data_url: str | None) -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=_messages(prompt, image_url, image_data_url),
    )
    return (resp.choices[0].message.content or "").strip()


def ask_llm(prompt: str, image_url: str | None = None, image_data_url: str | None = None, prefer_fallback: bool = False) -> dict:
    """
    Returns: {"text": str, "model": str, "fallback_used": bool}
    Raises: BothRateLimited if primary+fallback fail due to throttling.
    May raise other exceptions for non-429 errors (caught by view).
    """
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("Missing OPENROUTER_API_KEY")
    if not settings.DEFAULT_MODEL:
        raise RuntimeError("Missing DEFAULT_MODEL", DEFAULT_MODEL)
    if not settings.FALLBACK_MODEL:
        raise RuntimeError("Missing FALLBACK_MODEL", FALLBACK_MODEL)
    # 1) try primary
    first, second = (FALLBACK_MODEL, DEFAULT_MODEL) if prefer_fallback else (DEFAULT_MODEL, FALLBACK_MODEL)

    try:
        text = _call_model(first, prompt, image_url, image_data_url)
        return {"text": text, "model": first, "fallback_used": prefer_fallback}
    except (RateLimitError,) as e:
        # hard 429 on first -> try second
        try:
            text = _call_model(second, prompt, image_url, image_data_url)
            return {"text": text, "model": second, "fallback_used": not prefer_fallback}
        except Exception:
            raise BothRateLimited("Primary and fallback are rate-limited.")

    except (APIConnectionError, APIError, BadRequestError) as e:
        msg = f"{getattr(e, 'status_code', '')} {str(e)}".lower()
        if "429" in msg or "rate" in msg or "quota" in msg or "overload" in msg:
            try:
                text = _call_model(second, prompt, image_url, image_data_url)
                return {"text": text, "model": second, "fallback_used": not prefer_fallback}
            except Exception:
                raise BothRateLimited("Primary and fallback are rate-limited.")
        raise
