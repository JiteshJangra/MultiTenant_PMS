# API Documentation

This document provides details about the API endpoints and GraphQL schema used in the Mini Project Management application.

---

## Endpoint List

### 1. **GraphQL Endpoint**
- **URL**: `/graphql`
- **Method**: `POST`
- **Description**: The main GraphQL endpoint for querying and mutating data.

### 2. **Django Admin (Optional)**
- **URL**: `/admin`
- **Method**: `GET`
- **Description**: Admin interface for managing data (requires admin credentials).

---

## GraphQL Schema

### Queries

#### 1. **Get Projects**
Fetches a list of projects for a specific organization.

```graphql
query GetProjects($org: String!) {
  projects(organizationSlug: $org) {
    id
    name
    description
    status
    taskCount
    completedTasks
    dueDate
  }
}
```

- **Parameters**:
  - `org` (String): The slug of the organization.

- **Response**:
  ```json
  {
    "data": {
      "projects": [
        {
          "id": "1",
          "name": "Project A",
          "description": "Description of Project A",
          "status": "ACTIVE",
          "taskCount": 10,
          "completedTasks": 5,
          "dueDate": "2023-12-31"
        }
      ]
    }
  }
  ```

---

#### 2. **Get Tasks by Project**
Fetches tasks for a specific project.

```graphql
query TasksByProject($org: String!, $pid: ID!) {
  tasksByProject(organizationSlug: $org, projectId: $pid) {
    id
    title
    description
    status
    assigneeEmail
    comments {
      id
      content
      authorEmail
      timestamp
    }
  }
}
```

- **Parameters**:
  - `org` (String): The slug of the organization.
  - `pid` (ID): The ID of the project.

- **Response**:
  ```json
  {
    "data": {
      "tasksByProject": [
        {
          "id": "1",
          "title": "Task 1",
          "description": "Description of Task 1",
          "status": "TODO",
          "assigneeEmail": "user@example.com",
          "comments": [
            {
              "id": "1",
              "content": "This is a comment",
              "authorEmail": "commenter@example.com",
              "timestamp": "2023-10-01T12:00:00Z"
            }
          ]
        }
      ]
    }
  }
  ```

---

### Mutations

#### 1. **Create Organization**
Creates a new organization.

```graphql
mutation CreateOrg($name: String!, $slug: String!, $email: String!) {
  createOrganization(name: $name, slug: $slug, contactEmail: $email) {
    organization {
      id
      name
      slug
    }
  }
}
```

- **Parameters**:
  - `name` (String): The name of the organization.
  - `slug` (String): The unique slug for the organization.
  - `email` (String): The contact email for the organization.

- **Response**:
  ```json
  {
    "data": {
      "createOrganization": {
        "organization": {
          "id": "1",
          "name": "Organization A",
          "slug": "org-a"
        }
      }
    }
  }
  ```

---

#### 2. **Create Project**
Creates a new project under an organization.

```graphql
mutation CreateProject($slug: String!, $name: String!, $status: String!, $description: String, $dueDate: Date) {
  createProject(
    organizationSlug: $slug,
    name: $name,
    status: $status,
    description: $description,
    dueDate: $dueDate
  ) {
    project {
      id
      name
      status
      description
      dueDate
    }
  }
}
```

- **Parameters**:
  - `slug` (String): The slug of the organization.
  - `name` (String): The name of the project.
  - `status` (String): The status of the project (`ACTIVE`, `COMPLETED`, `ON_HOLD`).
  - `description` (String, optional): The description of the project.
  - `dueDate` (Date, optional): The due date of the project.

- **Response**:
  ```json
  {
    "data": {
      "createProject": {
        "project": {
          "id": "1",
          "name": "Project A",
          "status": "ACTIVE",
          "description": "Description of Project A",
          "dueDate": "2023-12-31"
        }
      }
    }
  }
  ```

---

#### 3. **Create Task**
Creates a new task under a project.

```graphql
mutation CreateTask($org: String!, $pid: ID!, $title: String!, $status: String!, $description: String, $assigneeEmail: String) {
  createTask(
    organizationSlug: $org,
    projectId: $pid,
    title: $title,
    status: $status,
    description: $description,
    assigneeEmail: $assigneeEmail
  ) {
    task {
      id
      title
      status
      assigneeEmail
      description
    }
  }
}
```

- **Parameters**:
  - `org` (String): The slug of the organization.
  - `pid` (ID): The ID of the project.
  - `title` (String): The title of the task.
  - `status` (String): The status of the task (`TODO`, `IN_PROGRESS`, `DONE`).
  - `description` (String, optional): The description of the task.
  - `assigneeEmail` (String, optional): The email of the assignee.

- **Response**:
  ```json
  {
    "data": {
      "createTask": {
        "task": {
          "id": "1",
          "title": "Task 1",
          "status": "TODO",
          "assigneeEmail": "user@example.com",
          "description": "Description of Task 1"
        }
      }
    }
  }
  ```

---

#### 4. **Update Task**
Updates an existing task.

```graphql
mutation UpdateTask($org: String!, $tid: ID!, $title: String, $status: String, $description: String, $assigneeEmail: String) {
  updateTask(
    organizationSlug: $org,
    taskId: $tid,
    title: $title,
    description: $description,
    status: $status,
    assigneeEmail: $assigneeEmail
  ) {
    task {
      id
      title
      status
      description
      assigneeEmail
    }
  }
}
```

- **Parameters**:
  - `org` (String): The slug of the organization.
  - `tid` (ID): The ID of the task.
  - `title` (String, optional): The new title of the task.
  - `status` (String, optional): The new status of the task.
  - `description` (String, optional): The new description of the task.
  - `assigneeEmail` (String, optional): The new assignee email.

---

#### 5. **Add Comment**
Adds a comment to a task.

```graphql
mutation AddComment($org: String!, $tid: ID!, $content: String!, $author: String!) {
  addTaskComment(
    organizationSlug: $org,
    taskId: $tid,
    content: $content,
    authorEmail: $author
  ) {
    comment {
      id
      content
      authorEmail
      timestamp
    }
  }
}
```

- **Parameters**:
  - `org` (String): The slug of the organization.
  - `tid` (ID): The ID of the task.
  - `content` (String): The content of the comment.
  - `author` (String): The email of the comment author.

- **Response**:
  ```json
  {
    "data": {
      "addTaskComment": {
        "comment": {
          "id": "1",
          "content": "This is a comment",
          "authorEmail": "commenter@example.com",
          "timestamp": "2023-10-01T12:00:00Z"
        }
      }
    }
  }
  ```

---

This document provides a comprehensive overview of the API endpoints and GraphQL schema used in the project. For further details, refer to the codebase or contact the development team.
