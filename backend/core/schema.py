import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment
from django.db.models import Count


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = "__all__"

class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()

    class Meta:
        model = Project
        fields = "__all__"

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        return self.tasks.filter(status="DONE").count()

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = "__all__"

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = "__all__"


class Query(graphene.ObjectType):
    organizations = graphene.List(OrganizationType)
    projects = graphene.List(ProjectType, organization_slug=graphene.String(required=True))
    tasks_by_project = graphene.List(TaskType, organization_slug=graphene.String(required=True), project_id=graphene.ID(required=True))

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_projects(self, info, organization_slug):
        return Project.objects.filter(organization__slug=organization_slug)

    def resolve_tasks_by_project(self, info, organization_slug, project_id):
        return Task.objects.filter(project_id=project_id, project__organization__slug=organization_slug)


class CreateOrganization(graphene.Mutation):
    organization = graphene.Field(OrganizationType)
    class Arguments:
        name = graphene.String(required=True)
        slug = graphene.String(required=True)
        contact_email = graphene.String(required=True)
    def mutate(self, info, name, slug, contact_email):
        org = Organization.objects.create(name=name, slug=slug, contact_email=contact_email)
        return CreateOrganization(organization=org)

class CreateProject(graphene.Mutation):
    project = graphene.Field(ProjectType)
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String(required=False)
        status = graphene.String(required=True)
        due_date = graphene.types.datetime.Date(required=False)
    def mutate(self, info, organization_slug, name, status, description="", due_date=None):
        org = Organization.objects.get(slug=organization_slug)
        project = Project.objects.create(organization=org, name=name, status=status, description=description, due_date=due_date)
        return CreateProject(project=project)

class UpdateProject(graphene.Mutation):
    project = graphene.Field(ProjectType)
    class Arguments:
        organization_slug = graphene.String(required=True)
        project_id = graphene.ID(required=True)
        name = graphene.String(required=False)
        description = graphene.String(required=False)
        status = graphene.String(required=False)
        due_date = graphene.types.datetime.Date(required=False)
    def mutate(self, info, organization_slug, project_id, **kwargs):
        project = Project.objects.get(id=project_id, organization__slug=organization_slug)
        for k, v in kwargs.items():
            if v is not None:
                setattr(project, k, v)
        project.save()
        return UpdateProject(project=project)

class CreateTask(graphene.Mutation):
    task = graphene.Field(TaskType)
    class Arguments:
        organization_slug = graphene.String(required=True)
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String(required=False)
        status = graphene.String(required=True)
        assignee_email = graphene.String(required=False)
        due_date = graphene.types.datetime.DateTime(required=False)
    def mutate(self, info, organization_slug, project_id, title, status, description="", assignee_email="", due_date=None):
        project = Project.objects.get(id=project_id, organization__slug=organization_slug)
        task = Task.objects.create(project=project, title=title, description=description, status=status, assignee_email=assignee_email, due_date=due_date)
        return CreateTask(task=task)

class UpdateTask(graphene.Mutation):
    task = graphene.Field(TaskType)
    class Arguments:
        organization_slug = graphene.String(required=True)
        task_id = graphene.ID(required=True)
        title = graphene.String(required=False)
        description = graphene.String(required=False)
        status = graphene.String(required=False)
        assignee_email = graphene.String(required=False)
        due_date = graphene.types.datetime.DateTime(required=False)
    def mutate(self, info, organization_slug, task_id, **kwargs):
        task = Task.objects.get(id=task_id, project__organization__slug=organization_slug)
        for k, v in kwargs.items():
            if v is not None:
                setattr(task, k, v)
        task.save()
        return UpdateTask(task=task)

class AddTaskComment(graphene.Mutation):
    comment = graphene.Field(TaskCommentType)
    class Arguments:
        organization_slug = graphene.String(required=True)
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)
    def mutate(self, info, organization_slug, task_id, content, author_email):
        task = Task.objects.get(id=task_id, project__organization__slug=organization_slug)
        comment = TaskComment.objects.create(task=task, content=content, author_email=author_email)
        return AddTaskComment(comment=comment)

class ProjectStats(graphene.ObjectType):
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()

class GetProjectStats(graphene.Mutation):
    stats = graphene.Field(ProjectStats)
    class Arguments:
        organization_slug = graphene.String(required=True)
        project_id = graphene.ID(required=True)
    def mutate(self, info, organization_slug, project_id):
        qs = Task.objects.filter(project_id=project_id, project__organization__slug=organization_slug)
        total = qs.count()
        done = qs.filter(status="DONE").count()
        rate = (done / total * 100.0) if total else 0.0
        return GetProjectStats(stats=ProjectStats(total_tasks=total, completed_tasks=done, completion_rate=rate))

class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    add_task_comment = AddTaskComment.Field()
    get_project_stats = GetProjectStats.Field()
