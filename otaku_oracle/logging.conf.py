# Simple logging setup via settings.py
# Add this at the bottom of settings.py:
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
        "file": {
            "class": "logging.FileHandler",
            "filename": str(BASE_DIR / "otaku_oracle.log"),
            "mode": "a",
        },
    },
    "root": {"handlers": ["console", "file"], "level": "INFO"},
}
