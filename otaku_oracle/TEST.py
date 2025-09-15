import os
from dotenv import load_dotenv
load_dotenv()

DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "default")
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "default/")

print("DEFAULT_MODEL:", DEFAULT_MODEL)
print("FALLBACK_MODEL:", FALLBACK_MODEL)