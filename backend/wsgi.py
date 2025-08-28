import os
from django.core.wsgi import get_wsgi_application

# Replace 'settings' with your actual settings module name if different
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

application = get_wsgi_application()
