import json
from django.conf import settings
from openai import OpenAI
from openai import APIError, RateLimitError, APIConnectionError, BadRequestError
import os
class BothRateLimited(Exception):
    """Raised when primary AND fallback are rate-limited / overloaded."""
    pass

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

DEFAULT_MODEL = settings.DEFAULT_MODEL
FALLBACK_MODEL = settings.FALLBACK_MODEL
ALT_MODEL_1 = settings.ALT_MODEL_1
ALT_MODEL_2 = settings.ALT_MODEL_2
MODEL_CHAIN = [m for m in [DEFAULT_MODEL, ALT_MODEL_1, ALT_MODEL_2, FALLBACK_MODEL] if m]

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


def ask_llm(
    prompt: str,
    image_url: str | None = None,
    image_data_url: str | None = None,
    prefer_fallback: bool = False,
) -> dict:
    """
    Try DEFAULT → ALT1 → ALT2 → FALLBACK (or FALLBACK first if prefer_fallback=True).
    Returns: {"text": str, "model": str, "fallback_used": bool}
    Raises:
      - BothRateLimited if *all* attempts failed due to 429/overload.
      - Re-raises non-rate-limit errors from the provider.
    """
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("Missing OPENROUTER_API_KEY")
    if not settings.DEFAULT_MODEL:
        raise RuntimeError("Missing DEFAULT_MODEL")
    if not settings.FALLBACK_MODEL:
        raise RuntimeError("Missing FALLBACK_MODEL")

    default_model = settings.DEFAULT_MODEL
    fallback_model = settings.FALLBACK_MODEL
    # pull optional alternates from Django settings or env (safe if unset)
    alt1 = (getattr(settings, "ALT_MODEL_1", os.getenv("ALT_MODEL_1", "")) or "").strip()
    alt2 = (getattr(settings, "ALT_MODEL_2", os.getenv("ALT_MODEL_2", "")) or "").strip()

    chain = [m for m in [default_model, alt1, alt2, fallback_model] if m]

    # If caller prefers fallback first (e.g., after a client-side 429), rotate it to front
    if prefer_fallback and fallback_model in chain:
        chain = [fallback_model] + [m for m in chain if m != fallback_model]

    last_err = None
    all_rate_limited = True  # flip to False if we see any non-429 error

    for model in chain:
        try:
            text = _call_model(model, prompt, image_url, image_data_url)
            return {
                "text": text,
                "model": model,
                "fallback_used": (model == fallback_model),
            }

        except RateLimitError as e:
            last_err = e
            continue

        except (APIConnectionError, APIError, BadRequestError) as e:
            # Some providers surface 429/overload through generic APIError
            msg = f"{getattr(e, 'status_code', '')} {str(e)}".lower()
            if ("429" in msg) or ("rate" in msg) or ("quota" in msg) or ("overload" in msg) or ("overloaded" in msg):
                last_err = e
                continue
            # non-rate-limit error -> stop cascading and re-raise
            all_rate_limited = False
            raise

        except Exception as e:
            all_rate_limited = False
            raise

    # If we exhausted the chain on rate-limit-like failures, signal 429 to the view
    if all_rate_limited:
        raise BothRateLimited(last_err or Exception("rate_limited"))

    # Otherwise, surface the last non-rate-limit error (should have been raised already)
    # This is defensive; normally we'd never reach here.
    raise last_err or RuntimeError("LLM call failed")
