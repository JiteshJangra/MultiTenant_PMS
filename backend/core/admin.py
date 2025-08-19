from django.contrib import admin
from .models import Organization, Project, Task, TaskComment

admin.site.register(Organization)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(TaskComment)
