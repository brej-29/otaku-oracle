from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_http_methods
from .openrouter_client import ask_llm, BothRateLimited
import json, logging
from django.views.decorators.csrf import ensure_csrf_cookie

logger = logging.getLogger(__name__)

@ensure_csrf_cookie
def home(request: HttpRequest):
    return render(request, "home.html")

@ensure_csrf_cookie
def about(request: HttpRequest):
    return render(request, "about.html")

@ensure_csrf_cookie
def playground(request: HttpRequest):
    return render(request, "playground.html")

# Simple GLB test viewer page (debug)
def glb_test(request: HttpRequest):
    return render(request, "glb_test.html")

@require_http_methods(["POST"])
def api_ask(request: HttpRequest):
    try:
        # Accept JSON or form-encoded
        if request.content_type and "application/json" in request.content_type:
            data = json.loads(request.body.decode("utf-8"))
        else:
            data = request.POST

        prompt = (data.get("prompt") or "").trim() if hasattr("", "trim") else (data.get("prompt") or "").strip()
        image_url = (data.get("image_url") or "").strip() or None
        image_data_url = (data.get("image_data_url") or "").strip() or None
        if not prompt:
            return JsonResponse({"ok": False, "error": "Empty prompt."}, status=400)

        logger.info(
            "LLM query: len=%d, image_url=%s, image_data=%s",
            len(prompt), bool(image_url), bool(image_data_url)
        )

        # Force fallback when header or body flag present
        force_fb = request.headers.get("X-Force-Fallback") == "1" or bool(data.get("force_fallback"))

        result = ask_llm(prompt, image_url=image_url, image_data_url=image_data_url, prefer_fallback=force_fb)
        return JsonResponse({
            "ok": True,
            "answer": result["text"],
            "model": result["model"],
            "fallback_used": result["fallback_used"],
        })

    except BothRateLimited:
        # Signal 429 so the UI can show the cooldown toast
        return JsonResponse({
            "ok": False,
            "error": "rate_limited",
            "message": "Primary & fallback busy. Try again soon."
        }, status=429)

    except Exception as e:
        logger.exception("api_ask failed")
        return JsonResponse({
            "ok": False,
            "error": "upstream_error",
            "message": str(e)[:400]
        }, status=502)


def error_view(request, exception=None):
    code = 404 if exception is not None else 500
    ctx = {
        "code": code,
        "title": "Page Not Found" if code == 404 else "Server Error",
        "detail": "That route looks like filler content." if code == 404
                  else "Our chakra ran dry mid-arc. We’re on it.",
    }
    return render(request, "error.html", ctx, status=code)