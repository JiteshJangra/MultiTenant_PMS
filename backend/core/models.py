from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class Organization(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    contact_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    STATUS_CHOICES = [("ACTIVE", "Active"), ("COMPLETED", "Completed"), ("ON_HOLD", "On Hold")]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [("TODO", "Todo"), ("IN_PROGRESS", "In Progress"), ("DONE", "Done")]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="TODO")
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    author_email = models.EmailField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author_email}"

@receiver([post_save, post_delete], sender=Task)
def update_project_status(sender, instance, **kwargs):
    project = instance.project
    tasks = project.tasks.all()

    if all(task.status == "DONE" for task in tasks):
        project.status = "COMPLETED"
    elif all(task.status != "IN_PROGRESS" for task in tasks):
        project.status = "ON_HOLD"
    else:
        project.status = "ACTIVE"

    project.save()
