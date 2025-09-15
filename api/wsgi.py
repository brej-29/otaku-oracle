# api/wsgi.py
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "otaku_oracle.settings")
application = get_wsgi_application()
app = application  # <-- Vercel needs a top-level 'app'
