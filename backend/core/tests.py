from django.test import TestCase
from .models import Organization, Project

class SmokeTest(TestCase):
    def test_create_org(self):
        org = Organization.objects.create(name="Acme", slug="acme", contact_email="admin@acme.com")
        self.assertEqual(str(org), "Acme")
        proj = Project.objects.create(organization=org, name="P1", status="ACTIVE")
        self.assertEqual(str(proj), "P1")
